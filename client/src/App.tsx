import AppRoutes from './routers/routers';
import Header from './components/Header';

import 'react-toastify/dist/ReactToastify.css';
import './App.css'


function App() {

  return (
    <>
      <div className="app">
        <Header />
        <main>
          <AppRoutes />
        </main>
    </div>

    </>
  )
}

export default App
