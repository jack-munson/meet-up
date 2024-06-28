import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export function Invite() {
    const { token } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        async function validateToken() {
            try {
                const response = await axios.get(`http://localhost:3000/api/invite/${token}`);
                
                if (response.data.valid) {
                    navigate(`/signin?token=${token}`);
                }
            } catch (error) {
                console.error('Error validating token:', error);
            }
        }

        validateToken();
    }, [token, navigate]);

    return null;
}