import Control from '@/pages/Control';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Control />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
