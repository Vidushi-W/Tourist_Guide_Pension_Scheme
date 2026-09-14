import { AppBar, Box, Button, Container, Divider, Drawer, List, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const width = 238;
const links = {
  APPLICANT: [['Dashboard','/applicant'],['New application','/applicant/applications/new'],['My applications','/applicant/applications'],['Profile','/applicant/profile']],
  SUBJECT_OFFICER: [['Dashboard','/officer'],['Submitted applications','/officer/applications'],['Reviewed applications','/officer/reviewed']],
  SSSB_ADMIN: [['Approved applications','/sssb'],['Completed applications','/sssb/completed']],
};
export function Shell() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation(); if (!user) return null;
  return <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: '#0c3f2d' }}><Toolbar><Typography variant="h6" sx={{ flexGrow: 1 }}>SUREKUMA <Typography component="span" sx={{ opacity: .68, ml: 1, fontSize: 13 }}>Tourism Employee Social Security Fund</Typography></Typography><Typography sx={{ mr: 2, fontSize: 14 }}>{user.email}</Typography><Button color="inherit" onClick={async()=>{await logout(); navigate('/login')}}>Sign out</Button></Toolbar></AppBar>
    <Drawer variant="permanent" sx={{ width, flexShrink: 0, '& .MuiDrawer-paper': { width, boxSizing: 'border-box' } }}><Toolbar/><Box sx={{ p: 2 }}><Typography variant="overline" color="text.secondary">{user.role.replaceAll('_',' ')}</Typography></Box><Divider/><List sx={{ px: 1 }}>{links[user.role].map(([label,to])=><ListItemButton key={to} component={NavLink} to={to} selected={location.pathname===to} sx={{ borderRadius: 2, mb: .5 }}><ListItemText primary={label}/></ListItemButton>)}</List></Drawer>
    <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}><Toolbar/><Container maxWidth="xl" sx={{ py: 4 }}><Outlet/></Container></Box>
  </Box>;
}

