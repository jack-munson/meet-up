import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export function Invite() {
    const { token } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        async function validateToken() {
            try {
                const response = await axios.get(`https://usemeetup-api.com/api/invite/${token}`);
                if (response.data.valid) { // Valid, unused invite
                    navigate(`/signin?token=${token}`);
                } else { // Invalid invite (likely because it's already been accepted)
                    navigate("/")
                }
            } catch (error) {
                console.error('Error validating token:', error);
            }
        }

        validateToken();
    }, [token, navigate]);

    return null;
}