function TrainCard({ date, modelType, fileName }) {
  return (
    <div className="bg-black border-2 border-white p-5 text-white m-2.5 rounded-none inline-block flex-shrink-0">
      <h1 className="mb-2.5">Datetime: {date}</h1>
      <h2 className="mb-2">Model Type: {modelType}</h2>
      <h2>File Name: {fileName}</h2>
    </div>
  );
}

export default TrainCard;
