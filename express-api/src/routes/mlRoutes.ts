import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const testUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
}).fields([
  { name: 'boost_file', maxCount: 1 },
  { name: 'all_years_file', maxCount: 1 },
  { name: 'final_year_file', maxCount: 1 },
  { name: 'target_file', maxCount: 1 },
  { name: 'target_year_file', maxCount: 1 },
]);
const trainUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
}).fields([{ name: 'training_data', maxCount: 1 }]);
const predictUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

/* 
- flow: input -> send input to flask -> receive output from flask -> output
- input: boost, all years, final year, target, target year files
- output: stats in test data table
*/
router.post(
  '/test',
  async (req: Request, res: Response, next: NextFunction) => {
    testUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const formData = new FormData();

        Object.entries(req.files!).forEach(([fieldName, files]) => {
          formData.append(fieldName, files[0].buffer, {
            filename: files[0].originalname,
            contentType: files[0].mimetype,
          });
        });

        const response = await axios.post(
          'http://localhost:5000/run_pipeline',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Origin: 'http://localhost:3030',
            },
            maxBodyLength: 50 * 1024 * 1024,
          },
        );

        res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          res
            .status(error.response?.status || 500)
            .json(error.response?.data || { error: 'Unknown error occurred' });
        } else {
          console.error('Proxy error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  },
);

/*
- flow: input -> send input to flask -> recieve output from flask -> send model file to s3 -> send data to train table -> output
- input: model type, training data
- output: model file
*/
router.post(
  '/train',
  async (req: Request, res: Response, next: NextFunction) => {
    trainUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const formData = new FormData();

        // Check if files exist
        if (!req.files || !('training_data' in req.files)) {
          return res.status(400).json({ error: 'No training file provided' });
        }

        const files = req.files as { [key: string]: Express.Multer.File[] };
        const trainingDataFile = files['training_data'][0];

        // Append file with field name expected by Flask
        formData.append('training_file', trainingDataFile.buffer, {
          filename: trainingDataFile.originalname,
          contentType: trainingDataFile.mimetype,
        });

        // Get model type from request body
        const modelType = req.body.model_type;

        // Forward to Flask endpoint
        const response = await axios.post(
          `http://localhost:5000/train?model_type=${modelType}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Origin: 'http://localhost:3030',
            },
            maxBodyLength: 50 * 1024 * 1024,
            responseType: 'arraybuffer', // Handle binary response
          },
        );

        // Forward headers and data to frontend
        res.set({
          'Content-Type': response.headers['content-type'],
          'Content-Disposition': response.headers['content-disposition'],
        });
        res.status(response.status).send(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Handle JSON error responses from Flask
          const status = error.response?.status || 500;
          let errorData = { error: 'Unknown error occurred' };
          if (error.response?.data) {
            try {
              errorData = JSON.parse(
                Buffer.from(error.response.data).toString(),
              );
            } catch (e) {
              errorData = { error: 'Failed to parse error response' };
            }
          }
          res.status(status).json(errorData);
        } else {
          console.error('Proxy error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  },
);

/*
- flow: input -> send input to flask -> receive output from flask -> send data to predict table -> output
- input: model file from selection dropdown
- output: predictions
*/

router.post(
  '/predict',
  predictUpload.fields([
    { name: 'model_file', maxCount: 1 },
    { name: 'test_file', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [key: string]: Express.Multer.File[] };

      // Validate files exist
      if (!files?.model_file?.[0] || !files?.test_file?.[0]) {
        res.status(400).json({ error: 'Missing required files' });
        return;
      }

      const formData = new FormData();

      // Handle model file
      const modelFile = files.model_file[0];
      formData.append('model_file', modelFile.buffer, {
        filename: modelFile.originalname,
        contentType: 'application/octet-stream',
      });

      // Handle test file
      const testFile = files.test_file[0];
      formData.append('test_file', testFile.buffer, {
        filename: testFile.originalname,
        contentType: testFile.mimetype,
      });

      // Forward to Flask
      const response = await axios.post(
        'http://localhost:5000/predict',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          },
          maxBodyLength: 50 * 1024 * 1024,
        },
      );

      res.status(response.status).json(response.data);
      return;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res
          .status(error.response?.status || 500)
          .json(error.response?.data || { error: 'Prediction failed' });
        return;
      }
      console.error('Prediction error:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  },
);

export default router;
