import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Button,
  Stepper, 
  Step, 
  StepLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
  InputAdornment,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Badge,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { ConfigData } from '../data/ConfigJson';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';

// Define interfaces for our data structures
interface Mapping {
  organization: string;
  projects: Record<string, {
    teams: string[];
    members: Record<string, string[]>;
  }>;
  timestamp: number;
}

// Main component wrapper with beautiful styling
const AdminConfigWrapper = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card
        elevation={6}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {/* Header Banner */}
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <SettingsIcon sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h5" color="white" fontWeight="500">
            Admin Configuration
          </Typography>
        </Box>
        
        <CardContent>
          <AdminConfig />
        </CardContent>
      </Card>
    </Container>
  );
};

const AdminConfig = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Organization', 'Projects', 'Teams', 'Team Members', 'Review'];
  
  // Form state
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectTeams, setProjectTeams] = useState<Record<string, string[]>>({});
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  
  // UI state
  const [projectSearchText, setProjectSearchText] = useState('');
  const [teamSearchText, setTeamSearchText] = useState('');
  const [memberSearchText, setMemberSearchText] = useState('');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [selectAllStatus, setSelectAllStatus] = useState<Record<string, boolean>>({});
  
  // Dialog state
  const [openNewOrgDialog, setOpenNewOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Saved configurations
  const [savedMappings, setSavedMappings] = useState<Mapping[]>([]);
  
  // Data source
  const [organizations, setOrganizations] = useState(ConfigData.OrgList);
  const projects = ConfigData.ProjectList.map(project => project.key);
  const teams = ConfigData.TeamList.map(team => team["Team Name"]);
  
  // Filtered lists
  const filteredProjects = projects.filter(project => 
    project.toLowerCase().includes(projectSearchText.toLowerCase())
  );
  
  const filteredTeams = teams.filter(team => 
    team.toLowerCase().includes(teamSearchText.toLowerCase())
  );
  
  // Get current project and teams
  const currentProject = selectedProjects[currentProjectIndex] || '';
  const currentProjectTeams = projectTeams[currentProject] || [];
  
  // Get all teams from all projects (flattened)
  const allTeams = Object.values(projectTeams).flat();
  const currentTeam = allTeams[currentTeamIndex] || '';
  
  // Load saved mappings from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('adminMappings');
    if (savedData) {
      try {
        setSavedMappings(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved mappings:", e);
      }
    }
  }, []);
  
  // Reset current indices when selections change
  useEffect(() => {
    if (selectedProjects.length > 0 && currentProjectIndex >= selectedProjects.length) {
      setCurrentProjectIndex(0);
    }
  }, [selectedProjects, currentProjectIndex]);
  
  useEffect(() => {
    if (allTeams.length > 0 && currentTeamIndex >= allTeams.length) {
      setCurrentTeamIndex(0);
    }
  }, [allTeams, currentTeamIndex]);
  
  // Get team members for the current team
  const getTeamMembers = (teamName: string) => {
    const selectedTeamData = ConfigData.TeamList.find(team => team["Team Name"] === teamName);
    if (selectedTeamData && selectedTeamData.Members) {
      return selectedTeamData.Members.map(member => 
        `${member.Name}${member.Loc ? ` (${member.Loc})` : ''}`
      );
    }
    return [];
  };
  
  // Current team members filtered by search
  const currentTeamMembers = getTeamMembers(currentTeam).filter(member => 
    member.toLowerCase().includes(memberSearchText.toLowerCase())
  );
  
  // Form handlers
  const handleAddNewOrg = () => {
    if (newOrgName.trim()) {
      setOrganizations(prev => [...prev, newOrgName.trim()]);
      setSelectedOrg(newOrgName.trim());
      setNewOrgName('');
      setOpenNewOrgDialog(false);
      
      showSnackbar(`Organization "${newOrgName.trim()}" has been added successfully`, 'success');
    }
  };
  
  const handleProjectToggle = (project: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(project)) {
        // When removing a project, also clean up its teams
        const newProjects = prev.filter(p => p !== project);
        setProjectTeams(prevTeams => {
          const newTeams = { ...prevTeams };
          delete newTeams[project];
          return newTeams;
        });
        return newProjects;
      } else {
        return [...prev, project];
      }
    });
  };
  
  const handleTeamToggle = (team: string, project: string) => {
    setProjectTeams(prev => {
      const updatedTeams = {
        ...prev,
        [project]: prev[project]?.includes(team)
          ? prev[project].filter(t => t !== team)
          : [...(prev[project] || []), team]
      };
      
      // If a team is removed, also clean up its members
      if (prev[project]?.includes(team) && !updatedTeams[project].includes(team)) {
        setTeamMembers(prevMembers => {
          const newMembers = { ...prevMembers };
          delete newMembers[team];
          return newMembers;
        });
      }
      
      return updatedTeams;
    });
  };
  
  const handleTeamMemberToggle = (member: string, team: string) => {
    setTeamMembers(prev => ({
      ...prev,
      [team]: prev[team]?.includes(member)
        ? prev[team].filter(m => m !== member)
        : [...(prev[team] || []), member]
    }));
  };
  
  const handleToggleAllMembers = (team: string) => {
    const isCurrentlySelectAll = selectAllStatus[team] || false;
    const members = getTeamMembers(team);
    
    setTeamMembers(prev => ({
      ...prev,
      [team]: isCurrentlySelectAll ? [] : members
    }));
    
    setSelectAllStatus(prev => ({
      ...prev,
      [team]: !isCurrentlySelectAll
    }));
  };
  
  const handleProjectTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentProjectIndex(newValue);
  };
  
  const handleTeamTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTeamIndex(newValue);
  };
  
  // Navigation handlers
  const handleNext = () => {
    if (isStepValid()) {
      if (activeStep === steps.length - 1) {
        saveConfiguration();
      } else {
        setActiveStep(prevStep => prevStep + 1);
      }
    } else {
      showValidationErrors();
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const saveConfiguration = () => {
    // Build project mappings
    const projectsMap: Record<string, { teams: string[], members: Record<string, string[]> }> = {};
    
    selectedProjects.forEach(project => {
      const teams = projectTeams[project] || [];
      const members: Record<string, string[]> = {};
      
      teams.forEach(team => {
        members[team] = teamMembers[team] || [];
      });
      
      projectsMap[project] = { teams, members };
    });
    
    // Create mapping object
    const mapping: Mapping = {
      organization: selectedOrg,
      projects: projectsMap,
      timestamp: Date.now()
    };
    
    // Add to saved mappings
    const updatedMappings = [...savedMappings, mapping];
    localStorage.setItem('adminMappings', JSON.stringify(updatedMappings));
    setSavedMappings(updatedMappings);
    
    showSnackbar('Configuration saved successfully!', 'success');
    resetForm();
  };
  
  const resetForm = () => {
    setActiveStep(0);
    setSelectedOrg('');
    setSelectedProjects([]);
    setProjectTeams({});
    setTeamMembers({});
    setCurrentProjectIndex(0);
    setCurrentTeamIndex(0);
    setSelectAllStatus({});
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const showValidationErrors = () => {
    let errorMessage = '';
    
    switch (activeStep) {
      case 0:
        errorMessage = 'Please select an organization';
        break;
      case 1:
        errorMessage = 'Please select at least one project';
        break;
      case 2:
        errorMessage = 'Please assign at least one team to each project';
        break;
      case 3:
        errorMessage = 'Please assign at least one member to each team';
        break;
    }
    
    showSnackbar(errorMessage, 'warning');
  };
  
  // Validation helpers
  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return selectedOrg !== '';
      case 1:
        return selectedProjects.length > 0;
      case 2:
        return selectedProjects.every(project => 
          (projectTeams[project]?.length || 0) > 0
        );
      case 3:
        return allTeams.every(team => 
          (teamMembers[team]?.length || 0) > 0
        );
      default:
        return true;
    }
  };
  
  const isProjectValid = (project: string): boolean => {
    return (projectTeams[project]?.length || 0) > 0;
  };
  
  const isTeamValid = (team: string): boolean => {
    return (teamMembers[team]?.length || 0) > 0;
  };
  
  // Delete saved mapping
  const handleDeleteMapping = (timestamp: number) => {
    const updatedMappings = savedMappings.filter(mapping => mapping.timestamp !== timestamp);
    localStorage.setItem('adminMappings', JSON.stringify(updatedMappings));
    setSavedMappings(updatedMappings);
    showSnackbar('Configuration deleted successfully', 'success');
  };
  
  return (
    <Box>
      {/* Stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ mb: 3 }}
      >
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Step 1: Organization Selection */}
        {activeStep === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Organization
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value as string)}
                  label="Organization"
                >
                  {organizations.map(org => (
                    <MenuItem key={org} value={org}>{org}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={() => setOpenNewOrgDialog(true)}
                startIcon={<AddIcon />}
                sx={{ height: '56px' }}
              >
                Add New
              </Button>
            </Box>
            
            {/* Saved Mappings */}
            {savedMappings.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Saved Configurations
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {savedMappings.map((mapping, index) => {
                    const projectCount = Object.keys(mapping.projects).length;
                    const teamCount = Object.values(mapping.projects).reduce(
                      (sum, { teams }) => sum + teams.length, 0
                    );
                    
                    return (
                      <Card key={index} variant="outlined" sx={{ width: 280, mb: 2 }}>
                        <CardHeader
                          title={mapping.organization}
                          subheader={`Created: ${new Date(mapping.timestamp).toLocaleDateString()}`}
                          titleTypographyProps={{ variant: 'subtitle1' }}
                          action={
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteMapping(mapping.timestamp)}
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        />
                        <Divider />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Projects: {projectCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Teams: {teamCount}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 2: Projects Selection */}
        {activeStep === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Select Projects for {selectedOrg}
              </Typography>
            </Box>
            
            {/* Projects Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects..."
              value={projectSearchText}
              onChange={(e) => setProjectSearchText(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: projectSearchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setProjectSearchText('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {/* Selection Summary */}
            {selectedProjects.length > 0 && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.light, 0.1), 
                borderRadius: 1 
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Projects ({selectedProjects.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProjects.map(project => (
                    <Chip
                      key={project}
                      label={project}
                      onDelete={() => handleProjectToggle(project)}
                      color="primary"
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Project Checkboxes */}
            <Paper sx={{ 
              maxHeight: 300, 
              overflow: 'auto', 
              p: 2,
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <FormGroup>
                {filteredProjects.map(project => (
                  <FormControlLabel
                    key={project}
                    control={
                      <Checkbox
                        checked={selectedProjects.includes(project)}
                        onChange={() => handleProjectToggle(project)}
                      />
                    }
                    label={project}
                  />
                ))}
              </FormGroup>
            </Paper>
            
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Selected {selectedProjects.length} project(s)
            </Typography>
            
            {selectedProjects.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please select at least one project to continue
              </Alert>
            )}
          </>
        )}
        
        {/* Step 3: Teams Selection */}
        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Teams for Each Project
            </Typography>
            
            {/* Project Tabs */}
            <Tabs
              value={currentProjectIndex}
              onChange={handleProjectTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              {selectedProjects.map((project, index) => {
                const teamsCount = projectTeams[project]?.length || 0;
                const isValid = isProjectValid(project);
                
                return (
                  <Tab 
                    key={project} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {project}
                        <Badge 
                          badgeContent={teamsCount} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        {isValid ? 
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} /> : 
                          teamsCount === 0 && <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        }
                      </Box>
                    }
                    id={`project-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Current Project Content */}
            {currentProject && (
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Project: {currentProject} ({currentProjectIndex + 1}/{selectedProjects.length})
                </Typography>
                
                {/* Teams Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search teams..."
                  value={teamSearchText}
                  onChange={(e) => setTeamSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: teamSearchText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setTeamSearchText('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Teams Selection Summary */}
                {currentProjectTeams.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Teams for {currentProject}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentProjectTeams.map(team => (
                        <Chip
                          key={team}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {team}
                              {teamMembers[team]?.length > 0 && (
                                <Badge 
                                  badgeContent={teamMembers[team].length} 
                                  color="secondary"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          onDelete={() => handleTeamToggle(team, currentProject)}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Teams Checkboxes */}
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {filteredTeams.map(team => (
                      <FormControlLabel
                        key={team}
                        control={
                          <Checkbox
                            checked={currentProjectTeams.includes(team)}
                            onChange={() => handleTeamToggle(team, currentProject)}
                          />
                        }
                        label={team}
                      />
                    ))}
                  </FormGroup>
                </Paper>
                
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Selected {currentProjectTeams.length} team(s) for {currentProject}
                  </Typography>
                  
                  {/* Project Navigation */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentProjectIndex === 0}
                      onClick={() => setCurrentProjectIndex(prev => Math.max(0, prev - 1))}
                      startIcon={<ArrowBackIcon />}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentProjectIndex === selectedProjects.length - 1}
                      onClick={() => setCurrentProjectIndex(prev => Math.min(selectedProjects.length - 1, prev + 1))}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 4: Team Members Selection */}
        {activeStep === 3 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Team Members
            </Typography>
            
            {/* Team Tabs */}
            <Tabs
              value={currentTeamIndex}
              onChange={handleTeamTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              {allTeams.map((team, index) => {
                const membersCount = teamMembers[team]?.length || 0;
                const isValid = isTeamValid(team);
                
                return (
                  <Tab 
                    key={team} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {team}
                        <Badge 
                          badgeContent={membersCount} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        {isValid ? 
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} /> : 
                          <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        }
                      </Box>
                    }
                    id={`team-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Current Team Content */}
            {currentTeam && (
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Team: {currentTeam} ({currentTeamIndex + 1}/{allTeams.length})
                </Typography>
                
                {/* Members Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search members..."
                  value={memberSearchText}
                  onChange={(e) => setMemberSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: memberSearchText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setMemberSearchText('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Members Selection Summary */}
                {teamMembers[currentTeam]?.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Members for {currentTeam}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {teamMembers[currentTeam].map(member => (
                        <Chip
                          key={member}
                          label={member}
                          onDelete={() => handleTeamMemberToggle(member, currentTeam)}
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Select All Button */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleToggleAllMembers(currentTeam)}
                  >
                    {selectAllStatus[currentTeam] ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
                
                {/* Members Checkboxes */}
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {currentTeamMembers.map(member => (
                      <FormControlLabel
                        key={member}
                        control={
                          <Checkbox
                            checked={teamMembers[currentTeam]?.includes(member) || false}
                            onChange={() => handleTeamMemberToggle(member, currentTeam)}
                          />
                        }
                        label={member}
                      />
                    ))}
                  </FormGroup>
                </Paper>
                
                import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Button,
  Stepper, 
  Step, 
  StepLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
  InputAdornment,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Badge,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { ConfigData } from '../data/ConfigJson';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';

// Define interfaces for our data structures
interface Mapping {
  organization: string;
  projects: Record<string, {
    teams: string[];
    members: Record<string, string[]>;
  }>;
  timestamp: number;
}

// Main component wrapper with beautiful styling
const AdminConfigWrapper = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card
        elevation={6}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {/* Header Banner */}
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <SettingsIcon sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h5" color="white" fontWeight="500">
            Admin Configuration
          </Typography>
        </Box>
        
        <CardContent>
          <AdminConfig />
        </CardContent>
      </Card>
    </Container>
  );
};

const AdminConfig = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Organization', 'Projects', 'Teams', 'Team Members', 'Review'];
  
  // Form state
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectTeams, setProjectTeams] = useState<Record<string, string[]>>({});
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  
  // UI state
  const [projectSearchText, setProjectSearchText] = useState('');
  const [teamSearchText, setTeamSearchText] = useState('');
  const [memberSearchText, setMemberSearchText] = useState('');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [selectAllStatus, setSelectAllStatus] = useState<Record<string, boolean>>({});
  
  // Dialog state
  const [openNewOrgDialog, setOpenNewOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Saved configurations
  const [savedMappings, setSavedMappings] = useState<Mapping[]>([]);
  
  // Data source
  const [organizations, setOrganizations] = useState(ConfigData.OrgList);
  const projects = ConfigData.ProjectList.map(project => project.key);
  const teams = ConfigData.TeamList.map(team => team["Team Name"]);
  
  // Filtered lists
  const filteredProjects = projects.filter(project => 
    project.toLowerCase().includes(projectSearchText.toLowerCase())
  );
  
  const filteredTeams = teams.filter(team => 
    team.toLowerCase().includes(teamSearchText.toLowerCase())
  );
  
  // Get current project and teams
  const currentProject = selectedProjects[currentProjectIndex] || '';
  const currentProjectTeams = projectTeams[currentProject] || [];
  
  // Get all teams from all projects (flattened)
  const allTeams = Object.values(projectTeams).flat();
  const currentTeam = allTeams[currentTeamIndex] || '';
  
  // Load saved mappings from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('adminMappings');
    if (savedData) {
      try {
        setSavedMappings(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved mappings:", e);
      }
    }
  }, []);
  
  // Reset current indices when selections change
  useEffect(() => {
    if (selectedProjects.length > 0 && currentProjectIndex >= selectedProjects.length) {
      setCurrentProjectIndex(0);
    }
  }, [selectedProjects, currentProjectIndex]);
  
  useEffect(() => {
    if (allTeams.length > 0 && currentTeamIndex >= allTeams.length) {
      setCurrentTeamIndex(0);
    }
  }, [allTeams, currentTeamIndex]);
  
  // Get team members for the current team
  const getTeamMembers = (teamName: string) => {
    const selectedTeamData = ConfigData.TeamList.find(team => team["Team Name"] === teamName);
    if (selectedTeamData && selectedTeamData.Members) {
      return selectedTeamData.Members.map(member => 
        `${member.Name}${member.Loc ? ` (${member.Loc})` : ''}`
      );
    }
    return [];
  };
  
  // Current team members filtered by search
  const currentTeamMembers = getTeamMembers(currentTeam).filter(member => 
    member.toLowerCase().includes(memberSearchText.toLowerCase())
  );
  
  // Form handlers
  const handleAddNewOrg = () => {
    if (newOrgName.trim()) {
      setOrganizations(prev => [...prev, newOrgName.trim()]);
      setSelectedOrg(newOrgName.trim());
      setNewOrgName('');
      setOpenNewOrgDialog(false);
      
      showSnackbar(`Organization "${newOrgName.trim()}" has been added successfully`, 'success');
    }
  };
  
  const handleProjectToggle = (project: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(project)) {
        // When removing a project, also clean up its teams
        const newProjects = prev.filter(p => p !== project);
        setProjectTeams(prevTeams => {
          const newTeams = { ...prevTeams };
          delete newTeams[project];
          return newTeams;
        });
        return newProjects;
      } else {
        return [...prev, project];
      }
    });
  };
  
  const handleTeamToggle = (team: string, project: string) => {
    setProjectTeams(prev => {
      const updatedTeams = {
        ...prev,
        [project]: prev[project]?.includes(team)
          ? prev[project].filter(t => t !== team)
          : [...(prev[project] || []), team]
      };
      
      // If a team is removed, also clean up its members
      if (prev[project]?.includes(team) && !updatedTeams[project].includes(team)) {
        setTeamMembers(prevMembers => {
          const newMembers = { ...prevMembers };
          delete newMembers[team];
          return newMembers;
        });
      }
      
      return updatedTeams;
    });
  };
  
  const handleTeamMemberToggle = (member: string, team: string) => {
    setTeamMembers(prev => ({
      ...prev,
      [team]: prev[team]?.includes(member)
        ? prev[team].filter(m => m !== member)
        : [...(prev[team] || []), member]
    }));
  };
  
  const handleToggleAllMembers = (team: string) => {
    const isCurrentlySelectAll = selectAllStatus[team] || false;
    const members = getTeamMembers(team);
    
    setTeamMembers(prev => ({
      ...prev,
      [team]: isCurrentlySelectAll ? [] : members
    }));
    
    setSelectAllStatus(prev => ({
      ...prev,
      [team]: !isCurrentlySelectAll
    }));
  };
  
  const handleProjectTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentProjectIndex(newValue);
  };
  
  const handleTeamTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTeamIndex(newValue);
  };
  
  // Navigation handlers
  const handleNext = () => {
    if (isStepValid()) {
      if (activeStep === steps.length - 1) {
        saveConfiguration();
      } else {
        setActiveStep(prevStep => prevStep + 1);
      }
    } else {
      showValidationErrors();
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const saveConfiguration = () => {
    // Build project mappings
    const projectsMap: Record<string, { teams: string[], members: Record<string, string[]> }> = {};
    
    selectedProjects.forEach(project => {
      const teams = projectTeams[project] || [];
      const members: Record<string, string[]> = {};
      
      teams.forEach(team => {
        members[team] = teamMembers[team] || [];
      });
      
      projectsMap[project] = { teams, members };
    });
    
    // Create mapping object
    const mapping: Mapping = {
      organization: selectedOrg,
      projects: projectsMap,
      timestamp: Date.now()
    };
    
    // Add to saved mappings
    const updatedMappings = [...savedMappings, mapping];
    localStorage.setItem('adminMappings', JSON.stringify(updatedMappings));
    setSavedMappings(updatedMappings);
    
    showSnackbar('Configuration saved successfully!', 'success');
    resetForm();
  };
  
  const resetForm = () => {
    setActiveStep(0);
    setSelectedOrg('');
    setSelectedProjects([]);
    setProjectTeams({});
    setTeamMembers({});
    setCurrentProjectIndex(0);
    setCurrentTeamIndex(0);
    setSelectAllStatus({});
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const showValidationErrors = () => {
    let errorMessage = '';
    
    switch (activeStep) {
      case 0:
        errorMessage = 'Please select an organization';
        break;
      case 1:
        errorMessage = 'Please select at least one project';
        break;
      case 2:
        errorMessage = 'Please assign at least one team to each project';
        break;
      case 3:
        errorMessage = 'Please assign at least one member to each team';
        break;
    }
    
    showSnackbar(errorMessage, 'warning');
  };
  
  // Validation helpers
  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return selectedOrg !== '';
      case 1:
        return selectedProjects.length > 0;
      case 2:
        return selectedProjects.every(project => 
          (projectTeams[project]?.length || 0) > 0
        );
      case 3:
        return allTeams.every(team => 
          (teamMembers[team]?.length || 0) > 0
        );
      default:
        return true;
    }
  };
  
  const isProjectValid = (project: string): boolean => {
    return (projectTeams[project]?.length || 0) > 0;
  };
  
  const isTeamValid = (team: string): boolean => {
    return (teamMembers[team]?.length || 0) > 0;
  };
  
  // Delete saved mapping
  const handleDeleteMapping = (timestamp: number) => {
    const updatedMappings = savedMappings.filter(mapping => mapping.timestamp !== timestamp);
    localStorage.setItem('adminMappings', JSON.stringify(updatedMappings));
    setSavedMappings(updatedMappings);
    showSnackbar('Configuration deleted successfully', 'success');
  };
  
  return (
    <Box>
      {/* Stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ mb: 3 }}
      >
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Step 1: Organization Selection */}
        {activeStep === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Organization
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value as string)}
                  label="Organization"
                >
                  {organizations.map(org => (
                    <MenuItem key={org} value={org}>{org}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={() => setOpenNewOrgDialog(true)}
                startIcon={<AddIcon />}
                sx={{ height: '56px' }}
              >
                Add New
              </Button>
            </Box>
            
            {/* Saved Mappings */}
            {savedMappings.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Saved Configurations
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {savedMappings.map((mapping, index) => {
                    const projectCount = Object.keys(mapping.projects).length;
                    const teamCount = Object.values(mapping.projects).reduce(
                      (sum, { teams }) => sum + teams.length, 0
                    );
                    
                    return (
                      <Card key={index} variant="outlined" sx={{ width: 280, mb: 2 }}>
                        <CardHeader
                          title={mapping.organization}
                          subheader={`Created: ${new Date(mapping.timestamp).toLocaleDateString()}`}
                          titleTypographyProps={{ variant: 'subtitle1' }}
                          action={
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteMapping(mapping.timestamp)}
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        />
                        <Divider />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Projects: {projectCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Teams: {teamCount}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 2: Projects Selection */}
        {activeStep === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Select Projects for {selectedOrg}
              </Typography>
            </Box>
            
            {/* Projects Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects..."
              value={projectSearchText}
              onChange={(e) => setProjectSearchText(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: projectSearchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setProjectSearchText('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {/* Selection Summary */}
            {selectedProjects.length > 0 && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.light, 0.1), 
                borderRadius: 1 
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Projects ({selectedProjects.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProjects.map(project => (
                    <Chip
                      key={project}
                      label={project}
                      onDelete={() => handleProjectToggle(project)}
                      color="primary"
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Project Checkboxes */}
            <Paper sx={{ 
              maxHeight: 300, 
              overflow: 'auto', 
              p: 2,
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <FormGroup>
                {filteredProjects.map(project => (
                  <FormControlLabel
                    key={project}
                    control={
                      <Checkbox
                        checked={selectedProjects.includes(project)}
                        onChange={() => handleProjectToggle(project)}
                      />
                    }
                    label={project}
                  />
                ))}
              </FormGroup>
            </Paper>
            
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Selected {selectedProjects.length} project(s)
            </Typography>
            
            {selectedProjects.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please select at least one project to continue
              </Alert>
            )}
          </>
        )}
        
        {/* Step 3: Teams Selection */}
        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Teams for Each Project
            </Typography>
            
            {/* Project Tabs */}
            <Tabs
              value={currentProjectIndex}
              onChange={handleProjectTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              {selectedProjects.map((project, index) => {
                const teamsCount = projectTeams[project]?.length || 0;
                const isValid = isProjectValid(project);
                
                return (
                  <Tab 
                    key={project} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {project}
                        <Badge 
                          badgeContent={teamsCount} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        {isValid ? 
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} /> : 
                          teamsCount === 0 && <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        }
                      </Box>
                    }
                    id={`project-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Current Project Content */}
            {currentProject && (
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Project: {currentProject} ({currentProjectIndex + 1}/{selectedProjects.length})
                </Typography>
                
                {/* Teams Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search teams..."
                  value={teamSearchText}
                  onChange={(e) => setTeamSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: teamSearchText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setTeamSearchText('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Teams Selection Summary */}
                {currentProjectTeams.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Teams for {currentProject}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentProjectTeams.map(team => (
                        <Chip
                          key={team}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {team}
                              {teamMembers[team]?.length > 0 && (
                                <Badge 
                                  badgeContent={teamMembers[team].length} 
                                  color="secondary"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          onDelete={() => handleTeamToggle(team, currentProject)}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Teams Checkboxes */}
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {filteredTeams.map(team => (
                      <FormControlLabel
                        key={team}
                        control={
                          <Checkbox
                            checked={currentProjectTeams.includes(team)}
                            onChange={() => handleTeamToggle(team, currentProject)}
                          />
                        }
                        label={team}
                      />
                    ))}
                  </FormGroup>
                </Paper>
                
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Selected {currentProjectTeams.length} team(s) for {currentProject}
                  </Typography>
                  
                  {/* Project Navigation */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentProjectIndex === 0}
                      onClick={() => setCurrentProjectIndex(prev => Math.max(0, prev - 1))}
                      startIcon={<ArrowBackIcon />}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentProjectIndex === selectedProjects.length - 1}
                      onClick={() => setCurrentProjectIndex(prev => Math.min(selectedProjects.length - 1, prev + 1))}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 4: Team Members Selection */}
        {activeStep === 3 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Team Members
            </Typography>
            
            {/* Team Tabs */}
            <Tabs
              value={currentTeamIndex}
              onChange={handleTeamTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              {allTeams.map((team, index) => {
                const membersCount = teamMembers[team]?.length || 0;
                const isValid = isTeamValid(team);
                
                return (
                  <Tab 
                    key={team} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {team}
                        <Badge 
                          badgeContent={membersCount} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        {isValid ? 
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} /> : 
                          <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        }
                      </Box>
                    }
                    id={`team-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Current Team Content */}
            {currentTeam && (
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Team: {currentTeam} ({currentTeamIndex + 1}/{allTeams.length})
                </Typography>
                
                {/* Members Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search members..."
                  value={memberSearchText}
                  onChange={(e) => setMemberSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: memberSearchText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setMemberSearchText('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Members Selection Summary */}
                {teamMembers[currentTeam]?.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Members for {currentTeam}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {teamMembers[currentTeam].map(member => (
                        <Chip
                          key={member}
                          label={member}
                          onDelete={() => handleTeamMemberToggle(member, currentTeam)}
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Select All Button */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleToggleAllMembers(currentTeam)}
                  >
                    {selectAllStatus[currentTeam] ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
                
                {/* Members Checkboxes */}
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {currentTeamMembers.map(member => (
                      <FormControlLabel
                        key={member}
                        control={
                          <Checkbox
                            checked={teamMembers[currentTeam]?.includes(member) || false}
                            onChange={() => handleTeamMemberToggle(member, currentTeam)}
                          />
                        }
                        label={member}
                      />
                    ))}
                  </FormGroup>
                </Paper>
                
                import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Button,
  Stepper, 
  Step, 
  StepLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
  InputAdornment,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Badge,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { ConfigData } from '../data/ConfigJson';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';

// Define interfaces for our data structures
interface Mapping {
  organization: string;
  projects: Record<string, {
    teams: string[];
    members: Record<string, string[]>;
  }>;
  timestamp: number;
}

// Main component wrapper with beautiful styling
const AdminConfigWrapper = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card
        elevation={6}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {/* Header Banner */}
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <SettingsIcon sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h5" color="white" fontWeight="500">
            Admin Configuration
          </Typography>
        </Box>
        
        <CardContent>
          <AdminConfig />
        </CardContent>
      </Card>
    </Container>
  );
};

const AdminConfig = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Organization', 'Projects', 'Teams', 'Team Members', 'Review'];
  
  // Form state
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectTeams, setProjectTeams] = useState<Record<string, string[]>>({});
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  
  // UI state
  const [projectSearchText, setProjectSearchText] = useState('');
  const [teamSearchText, setTeamSearchText] = useState('');
  const [memberSearchText, setMemberSearchText] = useState('');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [selectAllStatus, setSelectAllStatus] = useState<Record<string, boolean>>({});
  
  // Dialog state
  const [openNewOrgDialog, setOpenNewOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Saved configurations
  const [savedMappings, setSavedMappings] = useState<Mapping[]>([]);
  
  // Data source
  const [organizations, setOrganizations] = useState(ConfigData.OrgList);
  const projects = ConfigData.ProjectList.map(project => project.key);
  const teams = ConfigData.TeamList.map(team => team["Team Name"]);
  
  // Filtered lists
  const filteredProjects = projects.filter(project => 
    project.toLowerCase().includes(projectSearchText.toLowerCase())
  );
  
  const filteredTeams = teams.filter(team => 
    team.toLowerCase().includes(teamSearchText.toLowerCase())
  );
  
  // Get current project and teams
  const currentProject = selectedProjects[currentProjectIndex] || '';
  const currentProjectTeams = projectTeams[currentProject] || [];
  
  // Get all teams from all projects (flattened)
  const allTeams = Object.values(projectTeams).flat();
  const currentTeam = allTeams[currentTeamIndex] || '';
  
  // Load saved mappings from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('adminMappings');
    if (savedData) {
      try {
        setSavedMappings(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved mappings:", e);
      }
    }
  }, []);
  
  // Reset current indices when selections change
  useEffect(() => {
    if (selectedProjects.length > 0 && currentProjectIndex >= selectedProjects.length) {
      setCurrentProjectIndex(0);
    }
  }, [selectedProjects, currentProjectIndex]);
  
  useEffect(() => {
    if (allTeams.length > 0 && currentTeamIndex >= allTeams.length) {
      setCurrentTeamIndex(0);
    }
  }, [allTeams, currentTeamIndex]);
  
  // Get team members for the current team
  const getTeamMembers = (teamName: string) => {
    const selectedTeamData = ConfigData.TeamList.find(team => team["Team Name"] === teamName);
    if (selectedTeamData && selectedTeamData.Members) {
      return selectedTeamData.Members.map(member => 
        `${member.Name}${member.Loc ? ` (${member.Loc})` : ''}`
      );
    }
    return [];
  };
  
  // Current team members filtered by search
  const currentTeamMembers = getTeamMembers(currentTeam).filter(member => 
    member.toLowerCase().includes(memberSearchText.toLowerCase())
  );
  
  // Form handlers
  const handleAddNewOrg = () => {
    if (newOrgName.trim()) {
      setOrganizations(prev => [...prev, newOrgName.trim()]);
      setSelectedOrg(newOrgName.trim());
      setNewOrgName('');
      setOpenNewOrgDialog(false);
      
      showSnackbar(`Organization "${newOrgName.trim()}" has been added successfully`, 'success');
    }
  };
  
  const handleProjectToggle = (project: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(project)) {
        // When removing a project, also clean up its teams
        const newProjects = prev.filter(p => p !== project);
        setProjectTeams(prevTeams => {
          const newTeams = { ...prevTeams };
          delete newTeams[project];
          return newTeams;
        });
        return newProjects;
      } else {
        return [...prev, project];
      }
    });
  };
  
  const handleTeamToggle = (team: string, project: string) => {
    setProjectTeams(prev => {
      const updatedTeams = {
        ...prev,
        [project]: prev[project]?.includes(team)
          ? prev[project].filter(t => t !== team)
          : [...(prev[project] || []), team]
      };
      
      // If a team is removed, also clean up its members
      if (prev[project]?.includes(team) && !updatedTeams[project].includes(team)) {
        setTeamMembers(prevMembers => {
          const newMembers = { ...prevMembers };
          delete newMembers[team];
          return newMembers;
        });
      }
      
      return updatedTeams;
    });
  };
  
  const handleTeamMemberToggle = (member: string, team: string) => {
    setTeamMembers(prev => ({
      ...prev,
      [team]: prev[team]?.includes(member)
        ? prev[team].filter(m => m !== member)
        : [...(prev[team] || []), member]
    }));
  };
  
  const handleToggleAllMembers = (team: string) => {
    const isCurrentlySelectAll = selectAllStatus[team] || false;
    const members = getTeamMembers(team);
    
    setTeamMembers(prev => ({
      ...prev,
      [team]: isCurrentlySelectAll ? [] : members
    }));
    
    setSelectAllStatus(prev => ({
      ...prev,
      [team]: !isCurrentlySelectAll
    }));
  };
  
  const handleProjectTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentProjectIndex(newValue);
  };
  
  const handleTeamTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTeamIndex(newValue);
  };
  
  // Navigation handlers
  const handleNext = () => {
    if (isStepValid()) {
      if (activeStep === steps.length - 1) {
        saveConfiguration();
      } else {
        setActiveStep(prevStep => prevStep + 1);
      }
    } else {
      showValidationErrors();
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const saveConfiguration = () => {
    // Build project mappings
    const projectsMap: Record<string, { teams: string[], members: Record<string, string[]> }> = {};
    
    selectedProjects.forEach(project => {
      const teams = projectTeams[project] || [];
      const members: Record<string, string[]> = {};
      
      teams.forEach(team => {
        members[team] = teamMembers[team] || [];
      });
      
      projectsMap[project] = { teams, members };
    });
    
    // Create mapping object
    const mapping: Mapping = {
      organization: selectedOrg,
      projects: projectsMap,
      timestamp: Date.now()
    };
    
    // Add to saved mappings
    const updatedMappings = [...savedMappings, mapping];
    localStorage.setItem('adminMappings', JSON.stringify(updatedMappings));
    setSavedMappings(updatedMappings);
    
    showSnackbar('Configuration saved successfully!', 'success');
    resetForm();
  };
  
  const resetForm = () => {
    setActiveStep(0);
    setSelectedOrg('');
    setSelectedProjects([]);
    setProjectTeams({});
    setTeamMembers({});
    setCurrentProjectIndex(0);
    setCurrentTeamIndex(0);
    setSelectAllStatus({});
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const showValidationErrors = () => {
    let errorMessage = '';
    
    switch (activeStep) {
      case 0:
        errorMessage = 'Please select an organization';
        break;
      case 1:
        errorMessage = 'Please select at least one project';
        break;
      case 2:
        errorMessage = 'Please assign at least one team to each project';
        break;
      case 3:
        errorMessage = 'Please assign at least one member to each team';
        break;
    }
    
    showSnackbar(errorMessage, 'warning');
  };
  
  // Validation helpers
  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return selectedOrg !== '';
      case 1:
        return selectedProjects.length > 0;
      case 2:
        return selectedProjects.every(project => 
          (projectTeams[project]?.length || 0) > 0
        );
      case 3:
        return allTeams.every(team => 
          (teamMembers[team]?.length || 0) > 0
        );
      default:
        return true;
    }
  };
  
  const isProjectValid = (project: string): boolean => {
    return (projectTeams[project]?.length || 0) > 0;
  };
  
  const isTeamValid = (team: string): boolean => {
    return (teamMembers[team]?.length || 0) > 0;
  };
  
  // Delete saved mapping
  const handleDeleteMapping = (timestamp: number) => {
    const updatedMappings = savedMappings.filter(mapping => mapping.timestamp !== timestamp);
    localStorage.setItem('adminMappings', JSON.stringify(updatedMappings));
    setSavedMappings(updatedMappings);
    showSnackbar('Configuration deleted successfully', 'success');
  };
  
  return (
    <Box>
      {/* Stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ mb: 3 }}
      >
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Step 1: Organization Selection */}
        {activeStep === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Organization
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value as string)}
                  label="Organization"
                >
                  {organizations.map(org => (
                    <MenuItem key={org} value={org}>{org}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={() => setOpenNewOrgDialog(true)}
                startIcon={<AddIcon />}
                sx={{ height: '56px' }}
              >
                Add New
              </Button>
            </Box>
            
            {/* Saved Mappings */}
            {savedMappings.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Saved Configurations
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {savedMappings.map((mapping, index) => {
                    const projectCount = Object.keys(mapping.projects).length;
                    const teamCount = Object.values(mapping.projects).reduce(
                      (sum, { teams }) => sum + teams.length, 0
                    );
                    
                    return (
                      <Card key={index} variant="outlined" sx={{ width: 280, mb: 2 }}>
                        <CardHeader
                          title={mapping.organization}
                          subheader={`Created: ${new Date(mapping.timestamp).toLocaleDateString()}`}
                          titleTypographyProps={{ variant: 'subtitle1' }}
                          action={
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteMapping(mapping.timestamp)}
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        />
                        <Divider />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Projects: {projectCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Teams: {teamCount}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 2: Projects Selection */}
        {activeStep === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Select Projects for {selectedOrg}
              </Typography>
            </Box>
            
            {/* Projects Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects..."
              value={projectSearchText}
              onChange={(e) => setProjectSearchText(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: projectSearchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setProjectSearchText('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {/* Selection Summary */}
            {selectedProjects.length > 0 && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.light, 0.1), 
                borderRadius: 1 
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Projects ({selectedProjects.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProjects.map(project => (
                    <Chip
                      key={project}
                      label={project}
                      onDelete={() => handleProjectToggle(project)}
                      color="primary"
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Project Checkboxes */}
            <Paper sx={{ 
              maxHeight: 300, 
              overflow: 'auto', 
              p: 2,
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <FormGroup>
                {filteredProjects.map(project => (
                  <FormControlLabel
                    key={project}
                    control={
                      <Checkbox
                        checked={selectedProjects.includes(project)}
                        onChange={() => handleProjectToggle(project)}
                      />
                    }
                    label={project}
                  />
                ))}
              </FormGroup>
            </Paper>
            
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Selected {selectedProjects.length} project(s)
            </Typography>
            
            {selectedProjects.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please select at least one project to continue
              </Alert>
            )}
          </>
        )}
        
        {/* Step 3: Teams Selection */}
        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Teams for Each Project
            </Typography>
            
            {/* Project Tabs */}
            <Tabs
              value={currentProjectIndex}
              onChange={handleProjectTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              {selectedProjects.map((project, index) => {
                const teamsCount = projectTeams[project]?.length || 0;
                const isValid = isProjectValid(project);
                
                return (
                  <Tab 
                    key={project} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {project}
                        <Badge 
                          badgeContent={teamsCount} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        {isValid ? 
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} /> : 
                          teamsCount === 0 && <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        }
                      </Box>
                    }
                    id={`project-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Current Project Content */}
            {currentProject && (
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Project: {currentProject} ({currentProjectIndex + 1}/{selectedProjects.length})
                </Typography>
                
                {/* Teams Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search teams..."
                  value={teamSearchText}
                  onChange={(e) => setTeamSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: teamSearchText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setTeamSearchText('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Teams Selection Summary */}
                {currentProjectTeams.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Teams for {currentProject}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentProjectTeams.map(team => (
                        <Chip
                          key={team}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {team}
                              {teamMembers[team]?.length > 0 && (
                                <Badge 
                                  badgeContent={teamMembers[team].length} 
                                  color="secondary"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          onDelete={() => handleTeamToggle(team, currentProject)}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Teams Checkboxes */}
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {filteredTeams.map(team => (
                      <FormControlLabel
                        key={team}
                        control={
                          <Checkbox
                            checked={currentProjectTeams.includes(team)}
                            onChange={() => handleTeamToggle(team, currentProject)}
                          />
                        }
                        label={team}
                      />
                    ))}
                  </FormGroup>
                </Paper>
                
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Selected {currentProjectTeams.length} team(s) for {currentProject}
                  </Typography>
                  
                  {/* Project Navigation */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentProjectIndex === 0}
                      onClick={() => setCurrentProjectIndex(prev => Math.max(0, prev - 1))}
                      startIcon={<ArrowBackIcon />}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentProjectIndex === selectedProjects.length - 1}
                      onClick={() => setCurrentProjectIndex(prev => Math.min(selectedProjects.length - 1, prev + 1))}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 4: Team Members Selection */}
        {activeStep === 3 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Team Members
            </Typography>
            
            {/* Team Tabs */}
            <Tabs
              value={currentTeamIndex}
              onChange={handleTeamTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              {allTeams.map((team, index) => {
                const membersCount = teamMembers[team]?.length || 0;
                const isValid = isTeamValid(team);
                
                return (
                  <Tab 
                    key={team} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {team}
                        <Badge 
                          badgeContent={membersCount} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        {isValid ? 
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} /> : 
                          <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        }
                      </Box>
                    }
                    id={`team-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Current Team Content */}
            {currentTeam && (
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Team: {currentTeam} ({currentTeamIndex + 1}/{allTeams.length})
                </Typography>
                
                {/* Members Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search members..."
                  value={memberSearchText}
                  onChange={(e) => setMemberSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: memberSearchText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setMemberSearchText('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Members Selection Summary */}
                {teamMembers[currentTeam]?.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Members for {currentTeam}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {teamMembers[currentTeam].map(member => (
                        <Chip
                          key={member}
                          label={member}
                          onDelete={() => handleTeamMemberToggle(member, currentTeam)}
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Select All Button */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleToggleAllMembers(currentTeam)}
                  >
                    {selectAllStatus[currentTeam] ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
                
                {/* Members Checkboxes */}
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {currentTeamMembers.map(member => (
                      <FormControlLabel
                        key={member}
                        control={
                          <Checkbox
                            checked={teamMembers[currentTeam]?.includes(member) || false}
                            onChange={() => handleTeamMemberToggle(member, currentTeam)}
                          />
                        }
                        label={member}
                      />
                    ))}
                  </FormGroup>
                </Paper>
                
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Button,
  Stepper, 
  Step, 
  StepLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
  InputAdornment,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Badge,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { ConfigData } from '../data/ConfigJson';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';

// Define interfaces for our data structures
interface Mapping {
  organization: string;
  projects: Record<string, {
    teams: string[];
    members: Record<string, string[]>;
  }>;
  timestamp: number;
}

// Main component wrapper with beautiful styling
const AdminConfigWrapper = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card
        elevation={6}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {/* Header Banner */}
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <SettingsIcon sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h5" color="white" fontWeight="500">
            Admin Configuration
          </Typography>
        </Box>
        
        <CardContent>
          <AdminConfig />
        </CardContent>
      </Card>
    </Container>
  );
};

const AdminConfig = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Organization', 'Projects', 'Teams', 'Team Members', 'Review'];
  
  // Form state
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectTeams, setProjectTeams] = useState<Record<string, string[]>>({});
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  
  // UI state
  const [projectSearchText, setProjectSearchText] = useState('');
  const [teamSearchText, setTeamSearchText] = useState('');
  const [memberSearchText, setMemberSearchText] = useState('');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [selectAllStatus, setSelectAllStatus] = useState<Record<string, boolean>>({});
  
  // Dialog state
  const [openNewOrgDialog, setOpenNewOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Saved configurations
  const [savedMappings, setSavedMappings] = useState<Mapping[]>([]);
  
  // Data source
  const [organizations, setOrganizations] = useState(ConfigData.OrgList);
  const projects = ConfigData.ProjectList.map(project => project.key);
  const teams = ConfigData.TeamList.map(team => team["Team Name"]);
  
  // Filtered lists
  const filteredProjects = projects.filter(project => 
    project.toLowerCase().includes(projectSearchText.toLowerCase())
  );
  
  const filteredTeams = teams.filter(team => 
    team.toLowerCase().includes(teamSearchText.toLowerCase())
  );
  
  // Get current project and teams
  const currentProject = selectedProjects[currentProjectIndex] || '';
  const currentProjectTeams = projectTeams[currentProject] || [];
  
  // Get all teams from all projects (flattened)
  const allTeams = Object.values(projectTeams).flat();
  const currentTeam = allTeams[currentTeamIndex] || '';
  
  // Load saved mappings from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('adminMappings');
    if (savedData) {
      try {
        setSavedMappings(JSON.parse(savedData));
      } catch (e) {
        console.error("Error loading saved mappings:", e);
      }
    }
  }, []);
  
  // Reset current indices when selections change
  useEffect(() => {
    if (selectedProjects.length > 0 && currentProjectIndex >= selectedProjects.length) {
      setCurrentProjectIndex(0);
    }
  }, [selectedProjects, currentProjectIndex]);
  
  useEffect(() => {
    if (allTeams.length > 0 && currentTeamIndex >= allTeams.length) {
      setCurrentTeamIndex(0);
    }
  }, [allTeams, currentTeamIndex]);
  
  // Get team members for the current team
  const getTeamMembers = (teamName: string) => {
    const selectedTeamData = ConfigData.TeamList.find(team => team["Team Name"] === teamName);
    if (selectedTeamData && selectedTeamData.Members) {
      return selectedTeamData.Members.map(member => 
        `${member.Name}${member.Loc ? ` (${member.Loc})` : ''}`
      );
    }
    return [];
  };
  
  // Current team members filtered by search
  const currentTeamMembers = getTeamMembers(currentTeam).filter(member => 
    member.toLowerCase().includes(memberSearchText.toLowerCase())
  );
  
  // Form handlers
  const handleAddNewOrg = () => {
    if (newOrgName.trim()) {
      setOrganizations(prev => [...prev, newOrgName.trim()]);
      setSelectedOrg(newOrgName.trim());
      setNewOrgName('');
      setOpenNewOrgDialog(false);
      
      showSnackbar(`Organization "${newOrgName.trim()}" has been added successfully`, 'success');
    }
  };
  
  const handleProjectToggle = (project: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(project)) {
        // When removing a project, also clean up its teams
        const newProjects = prev.filter(p => p !== project);
        setProjectTeams(prevTeams => {
          const newTeams = { ...prevTeams };
          delete newTeams[project];
          return newTeams;
        });
        return newProjects;
      } else {
        return [...prev, project];
      }
    });
  };
  
  const handleTeamToggle = (team: string, project: string) => {
    setProjectTeams(prev => {
      const updatedTeams = {
        ...prev,
        [project]: prev[project]?.includes(team)
          ? prev[project].filter(t => t !== team)
          : [...(prev[project] || []), team]
      };
      
      // If a team is removed, also clean up its members
      if (prev[project]?.includes(team) && !updatedTeams[project].includes(team)) {
        setTeamMembers(prevMembers => {
          const newMembers = { ...prevMembers };
          delete newMembers[team];
          return newMembers;
        });
      }
      
      return updatedTeams;
    });
  };
  
  const handleTeamMemberToggle = (member: string, team: string) => {
    setTeamMembers(prev => ({
      ...prev,
      [team]: prev[team]?.includes(member)
        ? prev[team].filter(m => m !== member)
        : [...(prev[team] || []), member]
    }));
  };
  
  const handleToggleAllMembers = (team: string) => {
    const isCurrentlySelectAll = selectAllStatus[team] || false;
    const members = getTeamMembers(team);
    
    setTeamMembers(prev => ({
      ...prev,
      [team]: isCurrentlySelectAll ? [] : members
    }));
    
    setSelectAllStatus(prev => ({
      ...prev,
      [team]: !isCurrentlySelectAll
    }));
  };
  
  const handleProjectTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentProjectIndex(newValue);
  };
  
  const handleTeamTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTeamIndex(newValue);
  };
  
  // Navigation handlers
  const handleNext = () => {
    if (isStepValid()) {
      if (activeStep === steps.length - 1) {
        saveConfiguration();
      } else {
        setActiveStep(prevStep => prevStep + 1);
      }
    } else {
      showValidationErrors();
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const saveConfiguration = () => {
    // Build project mappings
    const projectsMap: Record<string, { teams: string[], members: Record<string, string[]> }> = {};
    
    selectedProjects.forEach(project => {
      const teams = projectTeams[project] || [];
      const members: Record<string, string[]> = {};
      
      teams.forEach(team => {
        members[team] = teamMembers[team] || [];
      });
      
      projectsMap[project] = { teams, members };
    });
    
    // Create mapping object
    const mapping: Mapping = {
      organization: selectedOrg,
      projects: projectsMap,
      timestamp: Date.now()
    };
    
    // Add to saved mappings
    const updatedMappings = [...savedMappings, mapping];
    localStorage.setItem('adminMappings', JSON.stringify(updatedMappings));
    setSavedMappings(updatedMappings);
    
    showSnackbar('Configuration saved successfully!', 'success');
    resetForm();
  };
  
  const resetForm = () => {
    setActiveStep(0);
    setSelectedOrg('');
    setSelectedProjects([]);
    setProjectTeams({});
    setTeamMembers({});
    setCurrentProjectIndex(0);
    setCurrentTeamIndex(0);
    setSelectAllStatus({});
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const showValidationErrors = () => {
    let errorMessage = '';
    
    switch (activeStep) {
      case 0:
        errorMessage = 'Please select an organization';
        break;
      case 1:
        errorMessage = 'Please select at least one project';
        break;
      case 2:
        errorMessage = 'Please assign at least one team to each project';
        break;
      case 3:
        errorMessage = 'Please assign at least one member to each team';
        break;
    }
    
    showSnackbar(errorMessage, 'warning');
  };
  
  // Validation helpers
  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return selectedOrg !== '';
      case 1:
        return selectedProjects.length > 0;
      case 2:
        return selectedProjects.every(project => 
          (projectTeams[project]?.length || 0) > 0
        );
      case 3:
        return allTeams.every(team => 
          (teamMembers[team]?.length || 0) > 0
        );
      default:
        return true;
    }
  };
  
  const isProjectValid = (project: string): boolean => {
    return (projectTeams[project]?.length || 0) > 0;
  };
  
  const isTeamValid = (team: string): boolean => {
    return (teamMembers[team]?.length || 0) > 0;
  };
  
  // Delete saved mapping
  const handleDeleteMapping = (timestamp: number) => {
    const updatedMappings = savedMappings.filter(mapping => mapping.timestamp !== timestamp);
    localStorage.setItem('adminMappings', JSON.stringify(updatedMappings));
    setSavedMappings(updatedMappings);
    showSnackbar('Configuration deleted successfully', 'success');
  };
  
  return (
    <Box>
      {/* Stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ mb: 3 }}
      >
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Step 1: Organization Selection */}
        {activeStep === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Organization
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value as string)}
                  label="Organization"
                >
                  {organizations.map(org => (
                    <MenuItem key={org} value={org}>{org}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                onClick={() => setOpenNewOrgDialog(true)}
                startIcon={<AddIcon />}
                sx={{ height: '56px' }}
              >
                Add New
              </Button>
            </Box>
            
            {/* Saved Mappings */}
            {savedMappings.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Saved Configurations
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {savedMappings.map((mapping, index) => {
                    const projectCount = Object.keys(mapping.projects).length;
                    const teamCount = Object.values(mapping.projects).reduce(
                      (sum, { teams }) => sum + teams.length, 0
                    );
                    
                    return (
                      <Card key={index} variant="outlined" sx={{ width: 280, mb: 2 }}>
                        <CardHeader
                          title={mapping.organization}
                          subheader={`Created: ${new Date(mapping.timestamp).toLocaleDateString()}`}
                          titleTypographyProps={{ variant: 'subtitle1' }}
                          action={
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteMapping(mapping.timestamp)}
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        />
                        <Divider />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Projects: {projectCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Teams: {teamCount}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 2: Projects Selection */}
        {activeStep === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Select Projects for {selectedOrg}
              </Typography>
            </Box>
            
            {/* Projects Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects..."
              value={projectSearchText}
              onChange={(e) => setProjectSearchText(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: projectSearchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setProjectSearchText('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {/* Selection Summary */}
            {selectedProjects.length > 0 && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.light, 0.1), 
                borderRadius: 1 
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Projects ({selectedProjects.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProjects.map(project => (
                    <Chip
                      key={project}
                      label={project}
                      onDelete={() => handleProjectToggle(project)}
                      color="primary"
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Project Checkboxes */}
            <Paper sx={{ 
              maxHeight: 300, 
              overflow: 'auto', 
              p: 2,
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <FormGroup>
                {filteredProjects.map(project => (
                  <FormControlLabel
                    key={project}
                    control={
                      <Checkbox
                        checked={selectedProjects.includes(project)}
                        onChange={() => handleProjectToggle(project)}
                      />
                    }
                    label={project}
                  />
                ))}
              </FormGroup>
            </Paper>
            
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Selected {selectedProjects.length} project(s)
            </Typography>
            
            {selectedProjects.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please select at least one project to continue
              </Alert>
            )}
          </>
        )}
        
        {/* Step 3: Teams Selection */}
        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Teams for Each Project
            </Typography>
            
            {/* Project Tabs */}
            <Tabs
              value={currentProjectIndex}
              onChange={handleProjectTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              {selectedProjects.map((project, index) => {
                const teamsCount = projectTeams[project]?.length || 0;
                const isValid = isProjectValid(project);
                
                return (
                  <Tab 
                    key={project} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {project}
                        <Badge 
                          badgeContent={teamsCount} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        {isValid ? 
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} /> : 
                          teamsCount === 0 && <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        }
                      </Box>
                    }
                    id={`project-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Current Project Content */}
            {currentProject && (
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Project: {currentProject} ({currentProjectIndex + 1}/{selectedProjects.length})
                </Typography>
                
                {/* Teams Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search teams..."
                  value={teamSearchText}
                  onChange={(e) => setTeamSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: teamSearchText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setTeamSearchText('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Teams Selection Summary */}
                {currentProjectTeams.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Teams for {currentProject}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentProjectTeams.map(team => (
                        <Chip
                          key={team}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {team}
                              {teamMembers[team]?.length > 0 && (
                                <Badge 
                                  badgeContent={teamMembers[team].length} 
                                  color="secondary"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          onDelete={() => handleTeamToggle(team, currentProject)}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Teams Checkboxes */}
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {filteredTeams.map(team => (
                      <FormControlLabel
                        key={team}
                        control={
                          <Checkbox
                            checked={currentProjectTeams.includes(team)}
                            onChange={() => handleTeamToggle(team, currentProject)}
                          />
                        }
                        label={team}
                      />
                    ))}
                  </FormGroup>
                </Paper>
                
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Selected {currentProjectTeams.length} team(s) for {currentProject}
                  </Typography>
                  
                  {/* Project Navigation */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentProjectIndex === 0}
                      onClick={() => setCurrentProjectIndex(prev => Math.max(0, prev - 1))}
                      startIcon={<ArrowBackIcon />}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentProjectIndex === selectedProjects.length - 1}
                      onClick={() => setCurrentProjectIndex(prev => Math.min(selectedProjects.length - 1, prev + 1))}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 4: Team Members Selection */}
        {activeStep === 3 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Team Members
            </Typography>
            
            {/* Team Tabs */}
            <Tabs
              value={currentTeamIndex}
              onChange={handleTeamTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              {allTeams.map((team, index) => {
                const membersCount = teamMembers[team]?.length || 0;
                const isValid = isTeamValid(team);
                
                return (
                  <Tab 
                    key={team} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {team}
                        <Badge 
                          badgeContent={membersCount} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                        {isValid ? 
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} /> : 
                          <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        }
                      </Box>
                    }
                    id={`team-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Current Team Content */}
            {currentTeam && (
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Team: {currentTeam} ({currentTeamIndex + 1}/{allTeams.length})
                </Typography>
                
                {/* Members Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search members..."
                  value={memberSearchText}
                  onChange={(e) => setMemberSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: memberSearchText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setMemberSearchText('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Members Selection Summary */}
                {teamMembers[currentTeam]?.length > 0 && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Members for {currentTeam}:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {teamMembers[currentTeam].map(member => (
                        <Chip
                          key={member}
                          label={member}
                          onDelete={() => handleTeamMemberToggle(member, currentTeam)}
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Select All Button */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleToggleAllMembers(currentTeam)}
                  >
                    {selectAllStatus[currentTeam] ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
                
                {/* Members Checkboxes */}
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {currentTeamMembers.map(member => (
                      <FormControlLabel
                        key={member}
                        control={
                          <Checkbox
                            checked={teamMembers[currentTeam]?.includes(member) || false}
                            onChange={() => handleTeamMemberToggle(member, currentTeam)}
                          />
                        }
                        label={member}
                      />
                    ))}
                  </FormGroup>
                </Paper>
                
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Selected {teamMembers[currentTeam]?.length || 0} member(s) for {currentTeam}
                  </Typography>
                  
                  {/* Team Navigation */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentTeamIndex === 0}
                      onClick={() => setCurrentTeamIndex(prev => Math.max(0, prev - 1))}
                      startIcon={<ArrowBackIcon />}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={currentTeamIndex === allTeams.length - 1}
                      onClick={() => setCurrentTeamIndex(prev => Math.min(allTeams.length - 1, prev + 1))}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 5: Review Configuration */}
        {activeStep === 4 && (
          <>
            <Typography variant="h6" gutterBottom>
              Review Configuration
            </Typography>
            
            {/* Organization */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Organization
              </Typography>
              <Typography variant="body1">{selectedOrg}</Typography>
            </Paper>
            
            {/* Projects and their Teams */}
            {selectedProjects.map(project => (
              <Paper key={project} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Project: {project}
                </Typography>
                
                {/* Teams in this Project */}
                {projectTeams[project]?.length > 0 ? (
                  <Box sx={{ ml: 2 }}>
                    {projectTeams[project].map(team => (
                      <Box key={team} sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Team: {team}
                        </Typography>
                        
                        {/* Team Members */}
                        {teamMembers[team]?.length > 0 ? (
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Members ({teamMembers[team].length}):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {teamMembers[team].map(member => (
                                <Chip
                                  key={member}
                                  label={member}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="error">
                            No members selected
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    No teams selected
                  </Typography>
                )}
              </Paper>
            ))}
            
            {/* Summary Statistics */}
            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.success.light, 0.1), borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Typography variant="body2">
                • Organization: {selectedOrg}
              </Typography>
              <Typography variant="body2">
                • Total Projects: {selectedProjects.length}
              </Typography>
              <Typography variant="body2">
                • Total Teams: {Object.values(projectTeams).flat().length}
              </Typography>
              <Typography variant="body2">
                • Total Team Members: {
                  Object.values(teamMembers)
                    .reduce((total, members) => total + members.length, 0)
                }
              </Typography>
            </Box>
          </>
        )}
      </Paper>
      
      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          variant="outlined"
          disabled={activeStep === 0} 
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        
        <Button 
          variant="contained"
          onClick={handleNext}
          disabled={!isStepValid()}
          endIcon={activeStep === steps.length - 1 ? <SaveIcon /> : <ArrowForwardIcon />}
          color={activeStep === steps.length - 1 ? "success" : "primary"}
        >
          {activeStep === steps.length - 1 ? 'Save Configuration' : 'Next'}
        </Button>
      </Box>
      
      {/* Add Dialog for new organization */}
      <Dialog open={openNewOrgDialog} onClose={() => setOpenNewOrgDialog(false)}>
        <DialogTitle>Add New Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewOrgDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddNewOrg} 
            variant="contained" 
            disabled={!newOrgName.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminConfigWrapper;
