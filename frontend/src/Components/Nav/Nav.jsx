/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import logo from "../../Images/head_logo.png";
import banner1 from "../../Images/banner1.png";
import banner2 from "../../Images/banner2.png";
import banner3 from "../../Images/banner3.png";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Additionals/AuthContext";
import Auth from "../Pages/Auth";
import icon1 from "../../icons/1.png";
import icon2 from "../../icons/2.png";
import icon3 from "../../icons/3.png";
import icon4 from "../../icons/4.png";
import icon5 from "../../icons/5.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function Nav({ onSearch }) {

    const { setIsCartOpen, totalItems } = useCart();
    const { user, logout } = useAuth();
    const [currentBanner, setCurrentBanner] = useState(0);
    const [showAuth, setShowAuth] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const banners = [banner1, banner2, banner3];
    const location = useLocation();
    const navigate = useNavigate();
    const hideBanner = location.pathname.startsWith("/admin");
    const isAlimentacion = location.pathname === "/Alimentacion";

    const [searchParams] = useSearchParams();

    const seccionEnUrl = isAlimentacion
        ? searchParams.get("seccion")
        : null;

    const svgUsuario = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className='navbar-svg-element'>
            <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 1.25C9.37678 1.25 7.25013 3.37665 7.25013 6C7.25013 8.62335 9.37678 10.75 12.0001 10.75C14.6235 10.75 16.7501 8.62335 16.7501 6C16.7501 3.37665 14.6235 1.25 12.0001 1.25ZM8.75013 6C8.75013 4.20507 10.2052 2.75 12.0001 2.75C13.7951 2.75 15.2501 4.20507 15.2501 6C15.2501 7.79493 13.7951 9.25 12.0001 9.25C10.2052 9.25 8.75013 7.79493 8.75013 6Z" fill="#e34f1d" />
            <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 12.25C9.68658 12.25 7.55506 12.7759 5.97558 13.6643C4.41962 14.5396 3.25013 15.8661 3.25013 17.5L3.25007 17.602C3.24894 18.7638 3.24752 20.222 4.52655 21.2635C5.15602 21.7761 6.03661 22.1406 7.22634 22.3815C8.4194 22.6229 9.97436 22.75 12.0001 22.75C14.0259 22.75 15.5809 22.6229 16.7739 22.3815C17.9637 22.1406 18.8443 21.7761 19.4737 21.2635C20.7527 20.222 20.7513 18.7638 20.7502 17.602L20.7501 17.5C20.7501 15.8661 19.5807 14.5396 18.0247 13.6643C16.4452 12.7759 14.3137 12.25 12.0001 12.25ZM4.75013 17.5C4.75013 16.6487 5.37151 15.7251 6.71098 14.9717C8.02693 14.2315 9.89541 13.75 12.0001 13.75C14.1049 13.75 15.9733 14.2315 17.2893 14.9717C18.6288 15.7251 19.2501 16.6487 19.2501 17.5C19.2501 18.8078 19.2098 19.544 18.5265 20.1004C18.156 20.4022 17.5366 20.6967 16.4763 20.9113C15.4194 21.1252 13.9744 21.25 12.0001 21.25C10.0259 21.25 8.58087 21.1252 7.52393 20.9113C6.46366 20.6967 5.84425 20.4022 5.47372 20.1004C4.79045 19.544 4.75013 18.8078 4.75013 17.5Z" fill="#e34f1d" />
        </svg>
    );

    const profileIcons = [icon1, icon2, icon3, icon4, icon5];

    useEffect(() => {
        if (!user) {
            setProfileImage(null);
            return;
        }

        const storageKey = `userProfileImage_${user.id}`;
        let savedImage = sessionStorage.getItem(storageKey);

        if (!savedImage) {
            const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % profileIcons.length;
            savedImage = profileIcons[randomIndex];
            sessionStorage.setItem(storageKey, savedImage);
        }

        setProfileImage(savedImage);

    }, [user]);

    const imagenPerfil = (
        <img
            src={profileImage}
            alt="Perfil"
            className='imagenUsuario'
        />
    );

    const goHome = () => { window.location.href = '/'; };

    const handleSeccionNav = (e, seccion) => {
        e.preventDefault();
        navigate(`/Alimentacion?seccion=${seccion}`);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const handleBannerChange = (index) => { setCurrentBanner(index); };

    return (
        <>
            <div className="navbar-wrapper">

                <img
                    src={logo}
                    alt="Logo Japanda"
                    className="logo-navbar"
                    onClick={goHome}
                />

                <div className="nav-searchbar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="search-svg" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                            stroke="#757575"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        type="text"
                        className="input-buscador"
                        placeholder="Buscar producto..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            onSearch(e.target.value.trim());
                        }}
                    />
                </div>

                {user?.rol === "admin" && (
                    <a href="/admin" className="navbar-element-admin">
                        <span className="nav-text">Admin Panel</span>
                    </a>
                )}

                <nav className="navbar">

                    <div className="navbar-item-wrapper">
                        <a href="/Alimentacion" className="navbar-element">
                            <span className="nav-text">
                                Alimentación&nbsp;
                                <svg className="svgFlecha" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M0.5 3.8501L6.65 10.0001C6.69489 10.0479 6.74911 10.0861 6.80931 10.1121C6.8695 10.1382 6.9344 10.1516 7 10.1516C7.0656 10.1516 7.1305 10.1382 7.19069 10.1121C7.25089 10.0861 7.30511 10.0479 7.35 10.0001L13.5 3.8501"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </a>

                        <div className="dropdown-menu">
                            {["Snack", "Dulce", "Salado", "Bebidas", "Ramen"].map(seccion => (
                                <a
                                    key={seccion}
                                    href={`/Alimentacion?seccion=${seccion}`}
                                    className={`dropdown-item ${seccionEnUrl === seccion ? "dropdown-item--active" : ""}`}
                                    onClick={(e) => handleSeccionNav(e, seccion)}
                                >
                                    {seccion}
                                </a>
                            ))}
                        </div>
                    </div>

                    <a href="/Decoracion" className="navbar-element">
                        <span className="nav-text">Decoración</span>
                    </a>

                    <a href="/Merchandising" className="navbar-element">
                        <span className="nav-text">Merchandising</span>
                    </a>

                    <a href="/Moda" className="navbar-element">
                        <span className="nav-text">Moda</span>
                    </a>

                    <a href="/Inciensos" className="navbar-element">
                        <span className="nav-text">
                            Inciensos <mark className="tag-new">¡NUEVO!</mark>
                        </span>
                    </a>

                    <div className="navbar-svg-element-wrapper">

                        <div className="side-container">
                            <a href="#" className="navbar-element" onClick={() => setIsCartOpen(true)}>
                                Carrito
                                {totalItems > 0 && (
                                    <span className="nav-cart-count">
                                        {totalItems}
                                    </span>
                                )}
                            </a>
                        </div>

                        <div className="side-container">

                            <a
                                href="#"
                                className="navbar-element"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!user) return setShowAuth(true);
                                    setShowDropdown(!showDropdown);
                                }}
                            >
                                {user ? user.nombre : "Log in"}
                            </a>

                            <a
                                href="#"
                                className="svg-wrapper"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!user) return setShowAuth(true);
                                    setShowDropdown(!showDropdown);
                                }}
                            >
                                {user ? imagenPerfil : svgUsuario}
                            </a>

                            {user && (
                                <div className={`user-dropdown ${showDropdown ? "open" : ""}`}>
                                    
                                    <div className="user-dropdown-header">
                                        <span className="user-dropdown-name">{user.nombre}</span>
                                        <span className="user-dropdown-email">{user.email}</span>
                                    </div>

                                    <hr className="user-dropdown-divider" />

                                    <a href="/perfil" className="user-dropdown-item">👤 Mis datos</a>
                                    <a href="/pedidos" className="user-dropdown-item">📦 Mis pedidos</a>
                                    <a href="/Soporte" className="user-dropdown-item">💬 Atención al cliente</a>

                                    <hr className="user-dropdown-divider" />

                                    <button
                                        className="user-dropdown-logout"
                                        onClick={(e) => {
                                            e.preventDefault();

                                            sessionStorage.removeItem(`userProfileImage_${user.id}`);

                                            logout();

                                            window.dispatchEvent(new Event("auth-change"));
                                            window.dispatchEvent(new Event("storage"));

                                            window.location.reload();
                                        }}
                                    >
                                        🚪 Cerrar sesión
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>

                </nav>
            </div>

            {showAuth && <Auth onClose={() => setShowAuth(false)} />}

            {!hideBanner && (
                <div className="banner-carousel">
                    <div
                        className="banner-track"
                        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                    >
                        {banners.map((banner, index) => (
                            <div className="banner-slide" key={index}>
                                <img src={banner} className="banner-ad" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default Nav;