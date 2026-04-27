import React, { useState } from "react";
import axios from "axios";

export default function Login({ setUser }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async() => {
        try {
            const res = await axios.post("http://localhost:5000/login", {
                username,
                password
            });

            if (res.data.token) {
                const userData = { id: res.data.userId, username: res.data.username, highScore: res.data.highScore };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            alert("Login failed: " + error.response ? .data ? .message || error.message);
        }
    };

    const handleRegister = async() => {
        try {
            await axios.post("http://localhost:5000/register", {
                username,
                password
            });
            alert("User Registered! Now Login");
        } catch (error) {
            alert("Registration failed: " + error.response ? .data ? .message || error.message);
        }
    };

    return ( <
        div style = {
            { textAlign: "center", backgroundColor: "lightblue", minHeight: "100vh", color: "white", padding: "20px" } } >
        <
        h2 > Login / Register < /h2> <
        input style = {
            { margin: "5px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" } }
        placeholder = "Username"
        onChange = { e => setUsername(e.target.value) }
        /><br / > < br / >
        <
        input style = {
            { margin: "5px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" } }
        type = "password"
        placeholder = "Password"
        onChange = { e => setPassword(e.target.value) }
        /><br / > < br / >
        <
        button style = {
            { backgroundColor: "white", color: "black", margin: "5px", padding: "10px 20px", border: "none", borderRadius: "5px" } }
        onClick = { handleLogin } > Login < /button> <
        button style = {
            { backgroundColor: "white", color: "black", margin: "5px", padding: "10px 20px", border: "none", borderRadius: "5px" } }
        onClick = { handleRegister } > Register < /button> <
        /div>
    );
}