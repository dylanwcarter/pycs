import LandingTopbar from '../components/LandingTopbar';

function AboutPage() {
  const publications = [
    {
      title:
        'Comparing Machine Learning Techniques for Alfalfa Biomass Yield Prediction',
      date: 'Oct 2022',
      link: 'https://www.researchgate.net/publication/364390863_Comparing_Machine_Learning_Techniques_for_Alfalfa_Biomass_Yield_Prediction',
    },
    {
      title: 'Data Synthesis for Alfalfa Biomass Yield Estimation',
      date: 'May 2022',
      link: 'https://www.researchgate.net/publication/366483625_Data_Synthesis_for_Alfalfa_Biomass_Yield_Estimation',
    },
    {
      title:
        'Using Machine Learning and Feature Selection for Alfalfa Yield Prediction',
      date: 'Feb 2021',
      link: 'https://www.researchgate.net/publication/349306527_Using_Machine_Learning_and_Feature_Selection_for_Alfalfa_Yield_Prediction',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-black">
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur-sm">
        <LandingTopbar />
        <hr className="border-t border-white/20" />
      </header>

      <main className="mx-auto max-w-4xl px-6 lg:px-8 py-12">
        {/* Title Section */}
        <h1 className="text-4xl font-bold text-white md:text-5xl mb-12">
          Predict Your Crops (PYCS)
        </h1>

        {/* Content Section */}
        <div className="space-y-8">
          <p className="text-xl text-gray-300 leading-relaxed">
            This project enables you to train custom machine learning models
            from your data, predict yields, and evaluate model performance. It
            was led by{' '}
            <a
              href="https://www.cs.uga.edu/directory/people/jonathan-vance-phd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Dr. Jonathan Vance
            </a>{' '}
            from The University of Georgia and is based on his PhD research on
            the prediction of alfalfa crop yields using machine learning and a
            synthetic data pipeline.
          </p>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              Research Publications
            </h2>

            <ul className="space-y-4">
              {publications.map((paper, index) => (
                <li key={index} className="group">
                  <a
                    href={paper.link}
                    className="flex flex-col hover:bg-white/5 p-4 rounded-lg transition-all duration-200 border border-transparent hover:border-white/10"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                      {paper.title}
                    </span>
                    <span className="text-sm text-gray-400 mt-1">
                      {paper.date}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AboutPage;
