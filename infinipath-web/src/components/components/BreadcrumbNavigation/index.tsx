
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

interface BreadcrumbNavigationProps {
  programName: string;
}

const BreadcrumbNavigation = ({ programName }: BreadcrumbNavigationProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />}
        sx={{ color: 'text.secondary' }}
      >
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="/choose-program">
          Choose Program
        </Link>
        <Typography color="text.primary">{programName}</Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbNavigation;
