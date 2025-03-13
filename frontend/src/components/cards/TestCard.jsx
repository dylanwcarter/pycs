function TestCard({ date, modelType, fileName }) {
  return (
    <div className="bg-black border-2 border-gray-200 p-5 text-gray-200 m-2.5 rounded-none inline-block flex-shrink-0">
      <h1 className="mb-2.5">Datetime: {date}</h1>
      <h2 className="mb-2">Model Type: {modelType}</h2>
      <h2 className="mb-2">File Name: {fileName}</h2>
      <button className="bg-black text-white rounded-lg text-sm px-2 py-1 border border-gray-800 hover:bg-gray-800 transition">
        View Plot
      </button>
    </div>
  );
}

export default TestCard;
