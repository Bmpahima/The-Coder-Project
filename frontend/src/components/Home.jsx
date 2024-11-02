import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";  
import Post from "./Post";
import Header from "./Header";
import Footer from "./Footer";

function Home() {
    const { userId } = useParams();  
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/home/user/${userId}`)  
            .then(res => res.json())  
            .then(data => {
                setPosts(data); 
            })
            .catch(error => {
                console.log("Error: " + error);
            });
    }, [userId]); 

    return (
        <div className="home">
            <Header
                userId={userId}
            />
            <h1 className="my-posts-title">Posts</h1>
            <div className="posts">
                {
                    posts.map((post, index) => {
                        return (
                            <Post 
                                key={index}
                                postId={post.id}
                                title={post.title}
                                date={post.date}
                                description={post.description}
                                img={post.image}
                                profileImg={post.profile_image} 
                                userId={userId}
                            />
                        ); 
                    })
                }
            </div>
            <Footer />
        </div>
    );
}

export default Home;
