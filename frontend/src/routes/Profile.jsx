import { useEffect, useState } from "react";
import { HomeHeader } from "../components/HomeHeader"
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import { getAuth } from "firebase/auth"
import "../styles/Profile.css"
import { Footer } from "../components/Footer";

export function Profile() {
    const [originalName, setOriginalName] = useState(null)
    const [firstName, setFirstName] = useState(null)
    const [lastName, setLastName] = useState(null)
    const [email, setEmail] = useState(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [meetings, setMeetings] = useState(null)
    const auth = getAuth()
    const user = auth.currentUser
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await axios.get("http://localhost:3000/api/get-user-info", {
                    params: { userId: user.uid }
                })
                console.log(userInfo.data.email)
                setFirstName(userInfo.data.firstName)
                setLastName(userInfo.data.lastName)
                setOriginalName(userInfo.data.firstName + ' ' + userInfo.data.lastName)
                setEmail(userInfo.data.email)
                setMeetings(userInfo.data.meetings)
            } catch (error) {
                console.error("Error fetching user info: ", error)
            }
        }

        fetchUserInfo()
    }, [user])

    const saveChanges = async () => {
        try {
            await axios.post("http://localhost:3000/api/change-name", {
                newFirstName: firstName,
                newLastName: lastName,
                userId: user.uid, 
                meetings: meetings
            })
            navigate('/home')
        } catch (error) {
            console.error("Error changing user info: ", error)
        }
    }

    const handleDeleteClick = () => {
        console.log(isDeleteOpen)
        if (isDeleteOpen) {
            deleteAccount()
        }
        setIsDeleteOpen(!isDeleteOpen)
    }

    const deleteAccount = async () => {

    }

    return (
        <div className="profile-page">
            <HomeHeader/>
            <div className="page-content">
                <div className="sub-header">
                    <div className="sub-header-text">Profile</div>
                </div>
                <div className="profile-content">
                    <div className="profile-info">
                        <div className="profile-section">
                            <div className="profile-section-header">Edit name</div>
                            <div className="profile-name-info">
                                <input 
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="profile-name-input"
                                    value={firstName}
                                    placeholder="First name"
                                />
                                <input 
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="profile-name-input"
                                    value={lastName}
                                    placeholder="Last name"
                                />
                            </div>
                            <button 
                                className={`save-changes-button ${originalName === firstName + ' ' + lastName ? 'disabled' : ''}`}
                                onClick={() => saveChanges()}
                                disabled={originalName === firstName + ' ' + lastName}>
                                    Save changes
                            </button>
                        </div>
                        <div className="profile-section">
                            <div className="profile-section-header">Email</div>
                            <div>{email || "Email"}</div>
                        </div>
                        <div className="profile-section">
                            <div className="profile-section-header">Delete account</div>
                            <button className="delete-account-button" onClick={() => handleDeleteClick()}>Delete</button>
                        </div>
                    </div>
                    {isDeleteOpen && 
                        <div className="overlay">

                        </div>
                    }
                </div>
            </div>
            <Footer/>
        </div>
    );
}
