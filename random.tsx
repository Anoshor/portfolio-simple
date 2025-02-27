import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Autocomplete, 
  TextField, 
  Button, 
  Stepper, 
  Step, 
  StepLabel,
  FormGroup, 
  FormControlLabel, 
  Checkbox,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Container,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import { ConfigData } from '../data/ConfigJson';

// Define interfaces for our data types
interface TeamMember {
  Name: string;
  Loc?: string;
}

interface Team {
  "Team Name": string;
  "Jira Key": string;
  "Manager": string;
  Members: TeamMember[];
}

interface Project {
  key: string;
  name?: string;
}

interface ProjectMapping {
  project: string;
  teams: string[];
  members: string[];
}

interface Configuration {
  id?: string;
  organization: string;
  mappings: ProjectMapping[];
  timestamp?: number;
}

// Wrapper component with beautiful styling
const AdminConfigWrapper = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card
        elevation={12}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
          backdropFilter: 'blur(4px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative'
        }}
      >
        {/* Header Banner */}
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            py: 3,
            px: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <SettingsIcon sx={{ color: 'white', fontSize: 32 }} />
          <Typography variant="h4" color="white" fontWeight="500">
            Admin Configuration
          </Typography>
        </Box>
        
        <CardContent sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
          <AdminConfig />
        </CardContent>
      </Card>
    </Container>
  );
};

const AdminConfig = () => {
  // Step state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Organization', 'Project & Teams', 'Review'];
  
  // Form state
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // Multiple project mappings
  const [projectMappings, setProjectMappings] = useState<ProjectMapping[]>([]);
  
  // New org/project dialogs
  const [newOrgDialogOpen, setNewOrgDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  // Search states
  const [teamSearchText, setTeamSearchText] = useState('');
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Saved configurations
  const [savedConfigs, setSavedConfigs] = useState<Configuration[]>([]);
  
  const theme = useTheme();
  
  // Get data from ConfigData
  const organizations = ConfigData.OrgList;
  const projects = ConfigData.ProjectList.map(project => project.key);
  
  const teams = ConfigData.TeamList.map(team => team["Team Name"]);
  const filteredTeams = teamSearchText 
    ? teams.filter(team => team.toLowerCase().includes(teamSearchText.toLowerCase()))
    : teams;

  // Load saved configurations from localStorage on initial render
  useEffect(() => {
    const savedConfigsString = localStorage.getItem('adminConfigurations');
    if (savedConfigsString) {
      setSavedConfigs(JSON.parse(savedConfigsString));
    }
  }, []);

  // Get team members for the selected teams
  const getTeamMembers = () => {
    let allMembers: string[] = [];
    
    selectedTeams.forEach(teamName => {
      const selectedTeamData = ConfigData.TeamList.find(team => team["Team Name"] === teamName);
      if (selectedTeamData && selectedTeamData.Members) {
        const teamMembers = selectedTeamData.Members.map(member => 
          `${member.Name}${member.Loc ? ` (${member.Loc})` : ''}`
        );
        allMembers = [...allMembers, ...teamMembers];
      }
    });
    
    // Remove duplicates
    return [...new Set(allMembers)];
  };

  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedOrg('');
    clearProjectTeamSelection();
    setProjectMappings([]);
  };

  const clearProjectTeamSelection = () => {
    setSelectedProject('');
    setSelectedTeams([]);
    setSelectedOptions([]);
  };

  const handleOrgChange = (event: any, newValue: string | null) => {
    setSelectedOrg(newValue || '');
    clearProjectTeamSelection();
    setProjectMappings([]);
  };

  const handleProjectChange = (event: any, newValue: string | null) => {
    setSelectedProject(newValue || '');
    setSelectedTeams([]);
    setSelectedOptions([]);
  };

  const handleTeamChange = (teamName: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamName)
        ? prev.filter(item => item !== teamName)
        : [...prev, teamName]
    );
  };

  const handleCheckboxChange = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleAddNewOrg = () => {
    if (newOrgName.trim()) {
      // Here we would normally send this to a backend API
      // For now, just update the UI and close the dialog
      setNewOrgDialogOpen(false);
      setSelectedOrg(newOrgName.trim());
      setSnackbarMessage(`Created new organization: ${newOrgName.trim()}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setNewOrgName('');
    }
  };

  // Add current project/teams/members to mappings
  const handleAddProjectMapping = () => {
    if (!selectedProject || selectedTeams.length === 0) {
      setSnackbarMessage("Please select a project and at least one team");
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    // Check if project already exists in mappings
    const existingIndex = projectMappings.findIndex(mapping => mapping.project === selectedProject);
    
    if (existingIndex >= 0) {
      // Update existing mapping
      const updatedMappings = [...projectMappings];
      updatedMappings[existingIndex] = {
        project: selectedProject,
        teams: selectedTeams,
        members: selectedOptions
      };
      setProjectMappings(updatedMappings);
    } else {
      // Add new mapping
      setProjectMappings([
        ...projectMappings,
        {
          project: selectedProject,
          teams: selectedTeams,
          members: selectedOptions
        }
      ]);
    }

    setSnackbarMessage(`Project "${selectedProject}" mapping added successfully`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Clear current selection to allow adding another project
    clearProjectTeamSelection();
  };

  const handleRemoveProjectMapping = (projectToRemove: string) => {
    setProjectMappings(projectMappings.filter(mapping => mapping.project !== projectToRemove));
  };

  const handleEditProjectMapping = (projectToEdit: string) => {
    const mappingToEdit = projectMappings.find(mapping => mapping.project === projectToEdit);
    if (mappingToEdit) {
      setSelectedProject(mappingToEdit.project);
      setSelectedTeams(mappingToEdit.teams);
      setSelectedOptions(mappingToEdit.members);
      setProjectMappings(projectMappings.filter(mapping => mapping.project !== projectToEdit));
    }
  };

  const handleSave = () => {
    if (projectMappings.length === 0 && (!selectedProject || selectedTeams.length === 0)) {
      setSnackbarMessage("Please add at least one project mapping");
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    // Add current selection to mappings if it exists
    let finalMappings = [...projectMappings];
    if (selectedProject && selectedTeams.length > 0) {
      finalMappings.push({
        project: selectedProject,
        teams: selectedTeams,
        members: selectedOptions
      });
    }
    
    const newConfig: Configuration = {
      id: Date.now().toString(),
      organization: selectedOrg,
      mappings: finalMappings,
      timestamp: Date.now()
    };
    
    // Save to localStorage
    const updatedConfigs = [...savedConfigs, newConfig];
    localStorage.setItem('adminConfigurations', JSON.stringify(updatedConfigs));
    setSavedConfigs(updatedConfigs);
    
    setSnackbarMessage('Configuration saved successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Reset the form
    handleReset();
  };

  const handleDeleteConfig = (id: string) => {
    const updatedConfigs = savedConfigs.filter(config => config.id !== id);
    localStorage.setItem('adminConfigurations', JSON.stringify(updatedConfigs));
    setSavedConfigs(updatedConfigs);
    
    setSnackbarMessage('Configuration deleted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0: // Organization
        return !!selectedOrg;
      case 1: // Project & Teams
        return true; // Always allow next since we can add multiple projects
      default:
        return true;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3, 
      maxWidth: 800,
      margin: '0 auto',
    }}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {activeStep === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Organization
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Autocomplete
                fullWidth
                value={selectedOrg}
                onChange={handleOrgChange}
                options={organizations}
                renderInput={(params) => (
                  <TextField {...params} label="Organization" />
                )}
              />
              <Button 
                variant="outlined" 
                onClick={() => setNewOrgDialogOpen(true)}
                startIcon={<AddIcon />}
              >
                New
              </Button>
            </Box>
          </>
        )}
        
        {activeStep === 1 && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Project Configuration
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Autocomplete
                  fullWidth
                  value={selectedProject}
                  onChange={handleProjectChange}
                  options={projects}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Project" />
                  )}
                  sx={{ mb: 2 }}
                />
                
                {selectedProject && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Select Teams for {selectedProject}
                    </Typography>
                    
                    {/* Search box */}
                    <TextField
                      fullWidth
                      label="Search Teams"
                      variant="outlined"
                      value={teamSearchText}
                      onChange={(e) => setTeamSearchText(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                        endAdornment: teamSearchText ? (
                          <IconButton size="small" onClick={() => setTeamSearchText('')}>
                            <CloseIcon />
                          </IconButton>
                        ) : null
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    {/* Selected teams */}
                    {selectedTeams.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Teams:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedTeams.map(team => (
                            <Chip 
                              key={team}
                              label={team}
                              onDelete={() => handleTeamChange(team)}
                              color="primary"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Team checkboxes */}
                    <Box sx={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 1
                    }}>
                      <FormGroup>
                        {filteredTeams.map(team => (
                          <FormControlLabel
                            key={team}
                            control={
                              <Checkbox
                                checked={selectedTeams.includes(team)}
                                onChange={() => handleTeamChange(team)}
                              />
                            }
                            label={team}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                    
                    {/* Team members selection */}
                    {selectedTeams.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Select Team Members
                        </Typography>
                        
                        {/* Selected members */}
                        {selectedOptions.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Selected Members:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedOptions.map(member => (
                                <Chip 
                                  key={member}
                                  label={member}
                                  onDelete={() => handleCheckboxChange(member)}
                                  color="secondary"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Team members checkboxes */}
                        <Box sx={{ 
                          maxHeight: '200px', 
                          overflowY: 'auto',
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          p: 1
                        }}>
                          {getTeamMembers().length > 0 ? (
                            <FormGroup>
                              {getTeamMembers().map(memberString => (
                                <FormControlLabel
                                  key={memberString}
                                  control={
                                    <Checkbox
                                      checked={selectedOptions.includes(memberString)}
                                      onChange={() => handleCheckboxChange(memberString)}
                                    />
                                  }
                                  label={memberString}
                                />
                              ))}
                            </FormGroup>
                          ) : (
                            <Typography variant="body2" color="text.secondary" align="center" py={2}>
                              No team members found for the selected teams.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Add mapping button */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddProjectMapping}
                        startIcon={<AddIcon />}
                        disabled={!selectedProject || selectedTeams.length === 0}
                      >
                        Add Project Mapping
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
              
              {/* Current mappings */}
              {projectMappings.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Current Project Mappings
                  </Typography>
                  
                  {projectMappings.map((mapping) => (
                    <Paper 
                      key={mapping.project} 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        borderLeft: `4px solid ${theme.palette.primary.main}` 
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="500">
                          Project: {mapping.project}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEditProjectMapping(mapping.project)}
                            sx={{ mr: 1 }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleRemoveProjectMapping(mapping.project)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {mapping.teams.map(team => (
                          <Chip key={team} label={team} size="small" color="primary" variant="outlined" />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {mapping.members.length} team members selected
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </>
        )}
        
        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Review Configuration
            </Typography>
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 2,
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="subtitle1">Organization:</Typography>
              <Typography variant="body1" sx={{ mb: 3, pl: 2 }}>{selectedOrg}</Typography>
              
              <Typography variant="subtitle1">Project Mappings:</Typography>
              
              {/* Include current selection if valid */}
              {selectedProject && selectedTeams.length > 0 && (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    my: 2, 
                    borderLeft: `4px solid ${theme.palette.success.main}`,
                    backgroundColor: alpha(theme.palette.success.light, 0.1)
                  }}
                >
                  <Typography variant="subtitle2">Current Selection</Typography>
                  <Typography variant="body2">
                    Project: <strong>{selectedProject}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Teams: {selectedTeams.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    Members: {selectedOptions.length} selected
                  </Typography>
                </Paper>
              )}
              
              {projectMappings.map((mapping, index) => (
                <Paper 
                  key={index} 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    my: 2, 
                    borderLeft: `4px solid ${theme.palette.primary.main}` 
                  }}
                >
                  <Typography variant="body2">
                    Project: <strong>{mapping.project}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Teams: {mapping.teams.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    Members: {mapping.members.length} selected
                  </Typography>
                </Paper>
              ))}
              
              {projectMappings.length === 0 && !selectedProject && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, pl: 2 }}>
                  No project mappings added yet.
                </Typography>
              )}
            </Box>
          </>
        )}
      </Paper>
      
      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button 
              variant="contained" 
              color="success"
              onClick={handleSave}
              startIcon={<SaveIcon />}
              disabled={projectMappings.length === 0 && (!selectedProject || selectedTeams.length === 0)}
            >
              Save Configuration
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={!isStepValid()}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Saved Configurations Section */}
      {savedConfigs.length > 0 && (
        <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Saved Configurations
          </Typography>
          {savedConfigs.map((config) => (
            <Paper key={config.id} elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="500">{config.organization}</Typography>
                <Box>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteConfig(config.id as string)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {new Date(config.timestamp as number).toLocaleString()}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" mt={1}>
                Project Mappings:
              </Typography>
              <List dense sx={{ pl: 2 }}>
                {config.mappings.map((mapping, idx) => (
                  <ListItem key={idx} sx={{ py: 0 }}>
                    <ListItemText 
                      primary={mapping.project}
                      secondary={`${mapping.teams.length} teams, ${mapping.members.length} members`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ))}
        </Paper>
      )}
      
      {/* New Organization Dialog */}
      <Dialog open={newOrgDialogOpen} onClose={() => setNewOrgDialogOpen(false)}>
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
          <Button onClick={() => setNewOrgDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewOrg} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminConfigWrapper;
