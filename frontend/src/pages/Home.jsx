import { Link } from "react-router-dom";
import AlertBanner from "./AlertBanner";

function Home() {
  // Sample news data - in a real app, this would come from an API
  const newsArticles = [
    {
      id: 1,
      title: "Nepal Records Highest Forest Fire Incidents in March 2024",
      excerpt: "The Department of Forests and Soil Conservation reports a 40% increase in forest fire incidents compared to last year, with dry weather conditions being the primary factor.",
      date: "March 15, 2024",
      source: "The Kathmandu Post",
      category: "Breaking News",
      image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "New AI System Helps Predict Forest Fires in Nepal",
      excerpt: "Researchers at Tribhuvan University have developed an advanced AI system that can predict forest fire risks with 85% accuracy using satellite data and weather patterns.",
      date: "March 12, 2024",
      source: "Nepal News",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Community Forest Groups Receive Fire Prevention Training",
      excerpt: "Over 500 community forest user groups across Nepal have received specialized training in fire prevention and early warning systems to protect their local forests.",
      date: "March 10, 2024",
      source: "Himalayan Times",
      category: "Community",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Government Announces New Forest Fire Prevention Policy",
      excerpt: "The Ministry of Forests and Environment has announced a comprehensive new policy aimed at reducing forest fire incidents by 50% over the next five years.",
      date: "March 8, 2024",
      source: "Republica",
      category: "Policy",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen">
      <AlertBanner />

      {/* Hero Section - Full Width */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          {/* Option 1: Background Image */}
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          />

          {/* Option 2: Background Video (uncomment if you have a video) */}
          {/* <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover"
          >
            <source src="/path-to-your-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video> */}
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/50 to-orange-800/60 z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight animate-fade-in">
              Nepal Forest Fire Watch
            </h1>
            <div className="text-5xl md:text-7xl mb-8 animate-bounce">
              🌲🔥
            </div>
          </div>

          <p className="text-xl md:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed font-light animate-fade-in-delay">
            Advanced forest fire monitoring and prediction system for Nepal.
            <br />
            <span className="text-green-300">Real-time satellite data, AI-powered predictions, and comprehensive analytics.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-delay-2">
            <Link
              to="/live-map"
              className="group bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-green-500/25"
            >
              <span className="flex items-center">
                <svg className="w-6 h-6 mr-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
                View Live Map
              </span>
            </Link>
            <Link
              to="/predict"
              className="group bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-orange-500/25"
            >
              <span className="flex items-center">
                <svg className="w-6 h-6 mr-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Predict Fire Risk
              </span>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              Comprehensive Fire Monitoring
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides everything you need to monitor, predict, and respond to forest fires in Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Live Map Feature */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-green-800 mb-4 text-center">
                Live Fire Map
              </h3>
              <p className="text-gray-700 text-center mb-6">
                Real-time visualization of active fire hotspots across Nepal using NASA satellite data.
              </p>
              <Link
                to="/live-map"
                className="block text-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Explore Map
              </Link>
            </div>

            {/* AI Prediction Feature */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4 text-center">
                AI Predictions
              </h3>
              <p className="text-gray-700 text-center mb-6">
                Advanced machine learning models predict fire risk based on weather, terrain, and historical data.
              </p>
              <Link
                to="/predict"
                className="block text-center bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Prediction
              </Link>
            </div>

            {/* Statistics Feature */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4 text-center">
                Analytics & Stats
              </h3>
              <p className="text-gray-700 text-center mb-6">
                Comprehensive statistics and trends analysis for informed decision-making.
              </p>
              <Link
                to="/stats"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Statistics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              Latest News & Updates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed about forest fire incidents, prevention efforts, and environmental news from across Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newsArticles.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${article.category === 'Breaking News' ? 'bg-red-100 text-red-800' :
                      article.category === 'Technology' ? 'bg-blue-100 text-blue-800' :
                        article.category === 'Community' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                      }`}>
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{article.source}</span>
                    <span>{article.date}</span>
                  </div>
                  <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/news"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View All News
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-800 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology combined with local expertise for the most accurate forest fire monitoring in Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Real-Time Updates</h3>
                  <p className="text-gray-600">Satellite data updated every 3-6 hours ensures you have the most current information.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-orange-800 mb-2">AI-Powered Predictions</h3>
                  <p className="text-gray-600">Machine learning algorithms provide accurate fire risk predictions based on multiple factors.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">Secure & Reliable</h3>
                  <p className="text-gray-600">Built with security in mind, ensuring your data and predictions are always protected.</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">Nepal-Specific</h3>
                  <p className="text-gray-600">Tailored specifically for Nepal's geography, climate, and fire patterns.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-teal-800 mb-2">Free Access</h3>
                  <p className="text-gray-600">Completely free to use, making fire monitoring accessible to everyone.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-800 mb-2">Early Warning</h3>
                  <p className="text-gray-600">Get alerts and notifications about potential fire risks in your area.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of users who trust our platform for forest fire monitoring and prediction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/live-map"
              className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Explore Live Map
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
