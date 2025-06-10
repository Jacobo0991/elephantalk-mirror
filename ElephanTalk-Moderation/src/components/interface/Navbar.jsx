'use client'

import { useSession, signOut } from "next-auth/react";
import React from "react"
import { RiFileWarningFill } from "react-icons/ri";
import { RiFileHistoryFill } from "react-icons/ri";
import { BeatLoader } from "react-spinners";
import { Button, Menu, MenuItem } from "@mui/material";

export const Navbar = React.memo(({
    activePage,
    setActivePage,
}) => {
    const session = useSession();

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <header className="flex items-center justify-between bg-white p-4 shadow-md" >
            <div className="flex items-center">
                <img src="/assets/logo.webp" alt="ElephanTalk Logo" className="h-6 mr-2" />
            </div>
            <nav className="flex space-x-4">
                <button
                    className={`flex items-center p-2 text-gray-700 hover:text-teal-500 ${activePage === 'monitor' ? 'border-b-2 border-teal-500' : ''}`}
                    onClick={() => setActivePage('monitor')}
                >
                    <RiFileWarningFill className="text-2xl mr-2" /> {/* Adjust the font size and margin */}
                    <span className="text-base">Monitor</span> {/* Adjust the text size if needed */}
                </button>
                <button
                    className={`flex items-center p-2 text-gray-700 hover:text-teal-500 ${activePage === 'history' ? 'border-b-2 border-teal-500' : ''}`}
                    onClick={() => setActivePage('history')}
                >
                    <RiFileHistoryFill className="text-2xl mr-2" /> {/* Adjust the font size and margin */}
                    <span className="text-base">History</span> {/* Adjust the text size if needed */}
                </button>
            </nav>
            <div className="text-gray-700">
                {(session?.data?.user?.name === undefined) ?
                    (<BeatLoader
                        color='#25a2b5'
                        size={10}
                    />) : (<Button onClick={handleClick}>
                        {`${session?.data?.user?.name} ${session?.data?.user?.lastname}`}
                    </Button>)}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    onClick={handleClose}
                >
                    <MenuItem onClick={() => signOut({ callbackUrl: "/login" })}>Logout</MenuItem>
                </Menu>
            </div>
        </header >
    );
});


Navbar.displayName = "Navbar";