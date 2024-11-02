import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import PostPage from "./PostPage"; 
import MyPosts from "./MyPosts";

function App() {
    return (
        <Router>
            <Routes>
                <Route 
                    path='/'
                    element={<Login />} 
                />
                <Route 
                    path='/home/user/:userId'
                    element={<Home />} 
                />
                <Route 
                    path="/user/:userId/post/:postId" 
                    element={<PostPage />} 
                /> 
                <Route 
                    path="/my-posts/user/:userId" 
                    element={<MyPosts />} 
                /> 
            </Routes>
        </Router>
    );
}

export default App;
