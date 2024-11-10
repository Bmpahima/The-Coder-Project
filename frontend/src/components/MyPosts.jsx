import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { useDropzone } from "react-dropzone";
import Post from "./Post";
import Header from "./Header";
import Footer from "./Footer";
import axios from "axios";

function MyPosts() {
    const { userId } = useParams();
    const navigate = useNavigate();  
    const [posts, setPosts] = useState([]);
    const [toAdd, setToAdd] = useState(false);
    const [postImgFile, setPostImgFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [newPost, setNewPost] = useState({
        title: "",
        description: "",
        content: "",
        image: "",
    });

    const handleNewPost = (event) => {
        const { name, value } = event.target;
    
        setNewPost(prevValue => ({
            ...prevValue,
            [name]: value
        }));
    }

    const onDrop = useCallback((acceptedFiles) => {
        setPostImgFile(acceptedFiles[0]);  
        console.log(acceptedFiles[0].type); 
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

    const submitNewPost =async (event) => {
        event.preventDefault(); 
        console.log("Submitting new post:", newPost);

        const data = new FormData();
        data.append("title", newPost.title);
        data.append("description", newPost.description);
        data.append("content", newPost.content);
        if (postImgFile) {
            data.append("postImgFile", postImgFile); 
        }
        try{ 
            const response = await axios.post(`http://localhost:3000/my-posts/user/${userId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            const resData = await response.data;

            console.log("Post added:", resData);
            navigate(`/user/${userId}/post/${resData.post.id}`);       
        }
        catch(error) {
            setErrorMessage(error.response?.data?.error || error.message); 
            console.error('Error:', error); 
        };
    }

    useEffect(() => {
        async function fetchMyPosts() {
            try {
                const response = await fetch(`http://localhost:3000/my-posts/user/${userId}`);
                const resData = await response.json();
                setPosts(resData); 
                setErrorMessage("");
            }
            catch (error) {
                console.log("Error: " + error);
            }
        }
        fetchMyPosts();
    }, [userId]);  
    

    return (
        <div className="myposts-page">  
            <Header userId={ userId } />
            <h1 className="my-posts-title">My Posts</h1>
            {
                posts.length > 0 ? (
                    <div className="posts my-posts-container">
                        {posts.map((post, index) => (
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
                        ))}
                    </div>
                ) : (
                    <div className="no-posts-message">No Posts Available.</div>
                )
                
            }
            <div className="post-options">
                <button onClick={() => { setToAdd(!toAdd) }}>{toAdd ? "Cancel" : "Add"}</button>
            </div>
            {
                toAdd && (
                    <div className="add-container">
                    <div className="post-page-content">
                        <form className="post-form-edit-add" onSubmit={submitNewPost}>
                            <input 
                                type="text" 
                                placeholder="Title" 
                                name="title" 
                                value={newPost.title} 
                                onChange={handleNewPost} 
                                required
                            /><br />
                            <input 
                                type="text" 
                                placeholder="Description" 
                                name="description" 
                                value={newPost.description} 
                                onChange={handleNewPost} 
                                required
                            /><br />
                            <textarea 
                                type="text" 
                                placeholder="Content" 
                                name="content" 
                                value={newPost.content} 
                                onChange={handleNewPost} 
                                required
                            /><br />
                            <div className="img-input">
                                    <div {...getRootProps()} className="dropzone">
                                        <input {...getInputProps()}/>
                                        {isDragActive ? (
                                            <p>Drop the files here...</p>
                                        ) : (
                                            <p>Drag your profile image here...</p>
                                        )}
                                    </div>
                                    {postImgFile && <p>{postImgFile.name}</p>}
                                </div>  <br />
                                {errorMessage && <p style={{margin: "-5px 0 5px 0"}}>{errorMessage}</p>}
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
                )
            }
            <Footer />
        </div>
    );
}

export default MyPosts;
