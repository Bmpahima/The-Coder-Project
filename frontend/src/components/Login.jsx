import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import Form from "./Form";
import axios from "axios";
import CloseIcon from '@mui/icons-material/Close';
import { setCharInCode } from "./data";

function Login() {
    const [wavesUp, setWavesUp] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); 
    const [verificationCode, setVerificationCode] = useState("");
    const [codeEntry, setCodeEntry] = useState("");
    const [verified, setVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [timer, setTimer] = useState(60); 
    const navigate = useNavigate(); 

    useEffect(() => {
        let countdown;
        if (verificationCode && timer > 0 && !verified) {
            countdown = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0 && !verified) {
            setVerificationCode(""); 
            setErrorMessage("Time expired. Please request a new code.");
        }

        return () => clearInterval(countdown); 
    }, [verificationCode, timer, verified]);

    const handleWaveClick = () => {
        setWavesUp(!wavesUp);  
    };

    const handleLoginSuccess = (userId) => {
        if (userId && userId !== 0) {
            navigate(`/home/user/${userId}`);  
        } else {
            console.error("Invalid user ID");
        }
    };

    const submitForgotPassword = async (event) => {
        event.preventDefault();
        try {
            const response = await  axios.post('http://localhost:3000/forgot-my-password', {email: email});

            const resData = response.data; 
            setVerificationCode(resData.code);
            setTimer(60); 
            setErrorMessage(""); 
            
        }
        catch (error) {
            setErrorMessage(error.response.data.error || "An error occurred");
            console.log("Error: " + error);
        }
    }

    const submitVerificationCode = (event) => {
        event.preventDefault();
        
        if (timer === 0) {
            setErrorMessage("Time expired. Please request a new code.");
            return;
        }

        if (codeEntry === verificationCode) {
            setVerified(true);
            setTimer(0); 
            setErrorMessage("");
        } else {
            setVerified(false);
            setErrorMessage("Not Verified");
        }
    }

    const submitNewPassword = async (event) => {
        event.preventDefault();
        
        if (newPassword !== confirmedPassword){
            setErrorMessage("Passwords are not identical");
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/submit-new-password', {
                email: email,
                newPassword: newPassword
            });

            const resData = response.data;
            alert(resData.message);
            resetForgotPasswordState();
            navigate('/');
        }
        catch (error) {
            setErrorMessage(error.response.data.error || "An error occurred");
            console.log("Error: " + error);
        }
    }

    const resetForgotPasswordState = () => {
        setForgotPassword(false);        
        setVerificationCode("");            
        setCodeEntry("");                 
        setVerified(false);                 
        setTimer(60);                        
        setErrorMessage("");              
        setEmail("");
    };
    
    return (
        <>
            <div className={forgotPassword ? "darkened-screen login" : "login"} style={{ position: 'relative' }}>
                <Form 
                    switch={handleWaveClick}
                    wavesUp={wavesUp} 
                    type={"Login"}
                    onLogin={handleLoginSuccess}  
                    setForgotPassword={setForgotPassword}

                />
                <h1 className={wavesUp ? "register-logo" : "login-logo"}>{"< The Coder />"}</h1>
                <div className={`white-background ${wavesUp ? 'up' : ''}`}>
                    <Form
                        switch={handleWaveClick}
                        wavesUp={wavesUp} 
                        type={"Register"}
                        onLogin={handleLoginSuccess}  
                    />
                </div>            
                <div className="waves">
                    <div className="wave" id="wave1" style={{ bottom: wavesUp ? "80vh" : "0px" }}></div>
                    <div className="wave" id="wave2" style={{ bottom: wavesUp ? "81vh" : "10px" }}></div>
                    <div className="wave" id="wave3" style={{ bottom: wavesUp ? "82vh" : "15px" }}></div>
                    <div className="wave" id="wave4" style={{ bottom: wavesUp ? "83vh" : "20px" }}></div>
                </div>
            </div>

            {forgotPassword && (
                <div className="forgot-form">
                    <button className="x" onClick={resetForgotPasswordState}><CloseIcon /></button>
                    <h1>Reset Your Password</h1>
                    <h2>We'll send you an email to reset your password</h2>
                    <form onSubmit={submitForgotPassword}>
                        <input type="email" placeholder="Email" name="email" value={email} onChange={(e) => { setEmail(e.target.value) }} required/><br />
                        <button type="submit">Submit</button>
                    </form>
                    {errorMessage && <p>{errorMessage}</p>}
                </div>
            )}

            {(forgotPassword && verificationCode) && (
                <div className="code-form">
                    <button className="x" onClick={resetForgotPasswordState}><CloseIcon /></button>
                    <h1>Enter the Verification Code</h1>
                    <h2>Code sent to {email}</h2>
                    <form onSubmit={submitVerificationCode}>
                        <div className="input-code-container">
                            <input type="text" name="code1" value={codeEntry[0]} onChange={(e) => { setCodeEntry(prev => setCharInCode(prev, 0, e.target.value)) }} maxLength="1" />
                            <input type="text" name="code2" value={codeEntry[1]} onChange={(e) => { setCodeEntry(prev => setCharInCode(prev, 1, e.target.value)) }} maxLength="1" />
                            <input type="text" name="code3" value={codeEntry[2]} onChange={(e) => { setCodeEntry(prev => setCharInCode(prev, 2, e.target.value)) }} maxLength="1" />
                            <input type="text" name="code4" value={codeEntry[3]} onChange={(e) => { setCodeEntry(prev => setCharInCode(prev, 3, e.target.value)) }} maxLength="1" />
                            <input type="text" name="code5" value={codeEntry[4]} onChange={(e) => { setCodeEntry(prev => setCharInCode(prev, 4, e.target.value)) }} maxLength="1" />
                            <input type="text" name="code6" value={codeEntry[5]} onChange={(e) => { setCodeEntry(prev => setCharInCode(prev, 5, e.target.value)) }} maxLength="1" />
                        </div>
                        <button type="submit">Submit</button>
                    </form>
                    <p>Time remaining: {timer} seconds</p>
                    {errorMessage && <p>{errorMessage}</p>}
                </div>
            )}

            {(forgotPassword && verified) && (
                <div className="verify-form">
                    <button className="x" onClick={resetForgotPasswordState}><CloseIcon /></button>
                    <h1>Verified!</h1>
                    <h2>Enter Your New Password</h2>
                    <form onSubmit={submitNewPassword}>
                        <input type="password" placeholder="New Password" name="newPassword" value={newPassword} onChange={(e) => { setNewPassword(e.target.value) }} /><br />
                        <input type="password" placeholder="Confirm Password" name="confirmedPassword" value={confirmedPassword} onChange={(e) => { setConfirmedPassword(e.target.value) }} /><br />
                        <button type="submit">Submit</button>
                    </form>
                    {errorMessage && <p>{errorMessage}</p>}
                </div>
            )}
        </>
    );
}

export default Login;
