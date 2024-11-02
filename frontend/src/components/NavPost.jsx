import React from "react";
import { useNavigate } from "react-router-dom";

function NavPost({ userId, posts }) {  
    const navigate = useNavigate(); 

    const handleClickPost = (id) => {
        navigate(`/user/${userId}/post/${id}`);
    }

    return (
        <div className="nav-posts">
            {posts.map((post) => (
                <div onClick={() => handleClickPost(post.id)} key={post.id} className="nav-post-item">
                    <img src={post.image} alt={post.title} />
                    <h4>{post.title}</h4>
                    <p>{post.description}</p>
                </div>
            ))}
        </div>
    );
}

export default NavPost;
