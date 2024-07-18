import { useEffect, useState } from "react";
import { HomeHeader } from "../components/HomeHeader"
import axios from "axios"
import { getAuth } from "firebase/auth"
import "../styles/Profile.css"
import { first, last } from "lodash";

export function Profile() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    let email = ''
    const auth = getAuth()
    const user = auth.currentUser

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await axios.get("http://localhost:3000/api/get-user-info", {
                    params: { userId: user.uid }
                })
                setFirstName(userInfo.data.first_name)
                setLastName(userInfo.data.last_name)
                email = userInfo.data.email
            } catch (error) {
                console.error("Error fetching user info: ", error)
            }
        }

        // fetchUserInfo()
    }, [user])

    return (
        <div className="profile-page">
            <HomeHeader></HomeHeader>
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
                        </div>
                        <div className="profile-section">
                            <div className="profile-section-header">Email</div>
                            <div>{email || "jack.munson21@gmail.com"}</div>
                        </div>
                        <div className="profile-section">
                            <div className="profile-section-header">Delete account</div>
                            <button className="delete-account-button">Delete</button>
                        </div>
                    </div>
                    <button className="save-changes-button">Save changes</button>
                </div>
            </div>
        </div>
    );
}
