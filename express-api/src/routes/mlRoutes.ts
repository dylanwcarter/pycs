import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
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

/* 
- flow: input -> send input to flask -> receive output from flask -> output
- input: boost, all years, final year, target, target year files
- output: stats in test data table
*/
router.post(
  '/test',
  async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err) => {
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
        console.log(formData);

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
    try {
    } catch (error) {
      console.log(error);
      next();
    }
  },
);

/*
- flow: input -> send input to flask -> receive output from flask -> send data to predict table -> output
- input: model file from selection dropdown
- output: predictions
*/
router.post(
  '/predict',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {
      console.log(error);
      next();
    }
  },
);

export default router;
