
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import PageHeader from '../PageHeader';

interface ProgramLayoutProps {
  children: React.ReactNode;
}

const ProgramLayout = ({ children }: ProgramLayoutProps) => {


  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      background: {
        default: '#f5f5f5',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        
        {/* Main content area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {/* Fixed Header */}
          <PageHeader />

          {/* Banner */}
          <Box sx={{ pt: '5rem' }}>
            <Box 
              sx={{ 
                width: '100%', 
                height: '12rem', 
                backgroundImage: 'url(/lovable-uploads/8f140035-f50b-40c4-b9b0-ac365bbd6cc7.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
            />
          </Box>

          {/* Main Content */}
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ProgramLayout;
