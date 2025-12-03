import AppRoutes from './routers/routers';
import Header from './components/Header';

import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';


function App() {

  return (
    <>
      <div className="app">
        <Header />
        <main>
          <AppRoutes />
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      </div>

    </>
  )
}

export default App
