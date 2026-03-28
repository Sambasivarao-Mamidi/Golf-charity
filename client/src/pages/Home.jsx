import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Golf<span className="text-emerald-600">Charity</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Golf Meets Giving
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Track your golf scores, support charity, and win monthly cash prizes. 
              Every game makes a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all text-lg shadow-lg shadow-emerald-200 hover:shadow-xl">
                Start Free Trial
              </Link>
              <Link to="/login" className="px-8 py-4 bg-white/70 backdrop-blur-sm text-gray-700 font-semibold rounded-xl border border-white/50 hover:bg-white/80 transition-all text-lg">
                Sign In
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="bg-white/50 backdrop-blur-sm py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '◎', title: 'Track Scores', desc: 'Record your Stableford scores and maintain your rolling 5-game history' },
                { icon: '♡', title: 'Support Charity', desc: 'Choose your favorite charity and allocate a minimum of 10% of winnings' },
                { icon: '◉', title: 'Win Monthly', desc: 'Enter monthly draws with chances to win based on your 5 numbers' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center p-6 bg-white/50 rounded-2xl border border-white/50 backdrop-blur-sm"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                    <span className="text-2xl text-white">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white/30 backdrop-blur-sm border-t border-white/20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2024 GolfCharity. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;