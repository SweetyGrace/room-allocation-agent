
import { AppBar, Toolbar, Box, IconButton, Avatar } from '@mui/material';
import { Notifications, Person } from '@mui/icons-material';

const PageHeader = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        left: { xs: 0, sm: '5rem' },
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: 1,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
        <Box>
          <img 
            src="/lovable-uploads/af00c1ef-8d89-4eea-83f4-48c40d2bad90.png" 
            alt="infinitheism" 
            style={{ height: '2rem' }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {[1, 2, 3].map((i) => (
            <Box 
              key={i}
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: 'error.main', 
                borderRadius: '50%' 
              }} 
            />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton>
            <Notifications sx={{ color: 'text.secondary' }} />
          </IconButton>
          <Avatar sx={{ bgcolor: 'grey.800' }}>
            <Person />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default PageHeader;
