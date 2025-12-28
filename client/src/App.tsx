import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';
import Header from './components/Header';
import ScrollToTopButton from './components/ScrollToTopButton';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routers/routers';


function App() {
  return (
    <>
      <div className="app">
        <AuthProvider>
          <Header />
          <main>
            <AppRoutes />
          </main>
          <Footer />
          <ScrollToTopButton />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </AuthProvider>
      </div>

    </>
  )
}

export default App
