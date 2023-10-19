import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './Pages/Home';
import Profile from './Pages/Profile';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <>
            <BrowserRouter>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path={'/Home'} element={<Home />} />
                    <Route path={'/Profile'} element={<Profile/>} />
                </Routes>
            </BrowserRouter>
        </>
    </React.StrictMode>
);
