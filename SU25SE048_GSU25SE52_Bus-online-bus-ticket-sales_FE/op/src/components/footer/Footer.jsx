import {
    Container,
    Grid,
    Typography,
    Link as MuiLink,
    Divider,
    Box
} from '@mui/material';
import {
    Email,
    Phone,
    LocationOn,
    DirectionsBus,
    Event,
    LocalOffer,
    Help
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                pt: 2,
                width: '100%',
                pb: 4,
                margin: 0,
                padding: 0,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                }
            }}
        >
            <Container
                maxWidth="lg"
                disableGutters
                sx={{
                    paddingLeft: '0 !important',
                    paddingRight: '0 !important',
                    marginLeft: '0 !important',
                    width: '100%',
                    maxWidth: '100% !important',
                    marginBottom: '40px'
                }}
            >
                <Grid container spacing={4} sx={{
                    width: '100%',
                    margin: '0 !important',
                    paddingLeft: { xs: 2, sm: 4, md: 6 },
                }}>
                    {/* Brand Section */}
                    <Grid item xs={12} md={4} sx={{ paddingLeft: '16px !important', marginTop: '60px' }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3,
                            '& svg': {
                                fontSize: '2.5rem',
                                mr: 2,
                                color: 'white'
                            }
                        }}>
                            <DirectionsBus />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(90deg, #fff, #a7a7a7)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent', textAlign: 'center',
                                    width: '100%',
                                    marginLeft: '-10px'
                                }}
                            >
                                TIỆN ÍCH
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                            Nền tảng đặt vé xe khách trực tuyến hàng đầu Việt Nam
                        </Typography>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} md={2} sx={{
                        marginLeft: '160px',

                    }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 'bold', mb: 3, position: 'relative',
                            textAlign: 'left',
                            marginTop: '60px'
                        }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: -8,
                                    left: 0,
                                    width: '40px',
                                    height: '3px',
                                    borderRadius: '3px',
                                    textAlign: 'center'
                                }}
                            />
                            Liên kết
                        </Typography>
                        <Box
                            component="ul"
                            sx={{
                                listStyle: 'none',
                                p: 0,
                                m: 0,
                                '& li': {
                                    mb: 1.5
                                }
                            }}
                        >
                            {[
                                { text: 'Trang chủ', to: '/home', icon: <Event sx={{ mr: 1, fontSize: '1.2rem' }} /> },
                                { text: 'Dịch vụ', to: '/services', icon: <LocalOffer sx={{ mr: 1, fontSize: '1.2rem' }} /> },
                                { text: 'Giới thiệu', to: '/about', icon: <Help sx={{ mr: 1, fontSize: '1.2rem' }} /> },
                                { text: 'Liên hệ', to: '/contact', icon: <Email sx={{ mr: 1, fontSize: '1.2rem' }} /> }
                            ].map((item, index) => (
                                <li key={index}>
                                    <MuiLink
                                        component={Link}
                                        to={item.to}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: 'white',
                                            textDecoration: 'none',
                                            justifyContent: 'flex-start',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                color: '#00d2ff',
                                                transform: 'translateX(5px)'
                                            }
                                        }}
                                    >
                                        {item.icon}
                                        {item.text}
                                    </MuiLink>
                                </li>
                            ))}
                        </Box>
                    </Grid>

                    {/* Contact Info */}
                    <Grid item xs={12} md={3} sx={{ marginLeft: '100px' }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 'bold', mb: 3, position: 'relative',
                            textAlign: 'center', marginTop: '60px'
                        }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: -8,
                                    left: 0,
                                    width: '40px',
                                    height: '3px',
                                    borderRadius: '3px',

                                }}
                            />
                            Liên hệ
                        </Typography>
                        <Box
                            component="ul"
                            sx={{
                                listStyle: 'none',
                                p: 0,
                                m: 0,
                                '& li': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2.5,
                                    textAlign: 'left',
                                    '& svg': {
                                        mr: 1.5,
                                        color: '#00d2ff',
                                        fontSize: '1.4rem'
                                    }
                                }
                            }}
                        >
                            <li>
                                <LocationOn />
                                <span>123 Đường ABC, Quận 1, TP.HCM</span>
                            </li>
                            <li>
                                <Phone />
                                <span>0837 942 153</span>
                            </li>
                            <li>
                                <Email />
                                <span>tienich58@gmail.com</span>
                            </li>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;