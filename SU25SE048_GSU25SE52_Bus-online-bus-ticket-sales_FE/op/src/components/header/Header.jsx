import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Home, Info, Login, PersonAdd, Mail, DirectionsBus } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <AppBar position="fixed" sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
            <Toolbar sx={{
                justifyContent: 'space-between',
                padding: '0 40px !important',
                height: '80px'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <Link to="/">
                        <img
                            src='Logo.png'
                            className='logo-img'
                            alt="Website Logo"
                            style={{
                                height: '60px',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                            }}
                        />
                    </Link>

                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        gap: '20px',
                        marginLeft: '40px'
                    }}>
                        {[
                            { path: "/", name: "Trang chủ", icon: <Home /> },
                            { path: "/services", name: "Dịch vụ", icon: <DirectionsBus /> },
                            { path: "/contact", name: "Liên hệ", icon: <Mail /> },
                            { path: "/about", name: "Giới thiệu", icon: <Info /> }
                        ].map((item) => (
                            <Button
                                key={item.path}
                                component={Link}
                                to={item.path}
                                startIcon={item.icon}
                                sx={{
                                    color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.8)',
                                    fontWeight: isActive(item.path) ? 600 : 400,
                                    fontSize: '16px',
                                    textTransform: 'none',
                                    letterSpacing: '0.5px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white'
                                    },
                                    '& .MuiButton-startIcon': {
                                        marginRight: '6px'
                                    }
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}
                    </Box>
                </Box>

                <Box sx={{
                    display: 'flex',
                    gap: '16px',
                    '& .MuiButton-root': {
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: 500,
                        textTransform: 'none',
                        fontSize: '15px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                }}>
                    <Button
                        component={Link}
                        to="/register"
                        variant="outlined"
                        startIcon={<PersonAdd />}
                        sx={{
                            color: 'white',
                            background: 'linear-gradient(135deg, #FF416C, #FF4B2B)', // Red-Purple → Red-Orange
                            '&:hover': { background: 'linear-gradient(135deg, #FF4B2B, #FF416C)' }
                        }}
                    >
                        Đăng ký
                    </Button>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        startIcon={<Login />}
                        sx={{
                            background: 'linear-gradient(135deg, #6A11CB, #4B6CB7)', // Purple-Blue
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }
                        }}
                    >
                        Đăng nhập
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;