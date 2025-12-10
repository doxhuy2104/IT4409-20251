import Header from "./components/Header";
import AppRoutes from "./routers/routers";
import Sidebar from "./components/Sidebar";

function App() {
  // Các trang khác → render Header + Sidebar + Main
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className="flex-none w-64 border-r border-gray-200 bg-white">
        <Sidebar />
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-none">
          <Header />
        </div>
        <main className="flex-1 overflow-auto px-8 py-6">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default App;
