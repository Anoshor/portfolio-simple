// First, let's update the data structure for teamMembers to include project context
interface Mapping {
  organization: string;
  projects: Record<
    string,
    {
      teams: string[];
      members: Record<string, string[]>;
    }
  >;
  timestamp: number;
}

const AdminConfig = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Organization', 'Projects', 'Teams & Members', 'Review'];
  
  // Form state
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectTeams, setProjectTeams] = useState<Record<string, string[]>>({});
  
  // Change teamMembers structure to include project context
  // Format: { [projectId]: { [teamId]: string[] } }
  const [teamMembers, setTeamMembers] = useState<Record<string, Record<string, string[]>>>({});
  
  // UI state
  const [projectSearchText, setProjectSearchText] = useState('');
  const [teamSearchText, setTeamSearchText] = useState('');
  const [memberSearchText, setMemberSearchText] = useState('');
  
  // For Step 3
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activeTeam, setActiveTeam] = useState<string>('');
  
  // Keep track of "Select All" toggles - now project-specific
  const [selectAllStatus, setSelectAllStatus] = useState<Record<string, Record<string, boolean>>>({});
  
  // Dialog state
  const [openNewOrgDialog, setOpenNewOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  // Notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = 
    useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Saved configurations
  const [savedMappings, setSavedMappings] = useState<Mapping[]>([]);
  
  // Data source
  const [organizations, setOrganizations] = useState(ConfigData.OrgList);
  const projects = ConfigData.ProjectList.map((project) => project.key);
  const teams = ConfigData.TeamList.map((team) => team['Team Name']);
  
  // Load saved mappings from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('adminMappings');
    if (savedData) {
      try {
        setSavedMappings(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading saved mappings:', e);
      }
    }
  }, []);
  
  // Filtered lists
  const filteredProjects = projects.filter((p) =>
    p.toLowerCase().includes(projectSearchText.toLowerCase())
  );
  
  const filteredTeams = teams.filter((t) =>
    t.toLowerCase().includes(teamSearchText.toLowerCase())
  );
  
  // Current project in the tab
  const currentProject = selectedProjects[currentProjectIndex] || '';
  const currentProjectTeams = projectTeams[currentProject] || [];
  
  // Get members for current project/team combination
  const getCurrentTeamMembers = (project: string, team: string): string[] => {
    return teamMembers[project]?.[team] || [];
  };
  
  // If the user unchecks the currently active team, reset activeTeam
  useEffect(() => {
    const projectTeamsList = currentProjectTeams;
    if (activeTeam && !projectTeamsList.includes(activeTeam)) {
      setActiveTeam('');
    }
  }, [currentProjectTeams, activeTeam]);
  
  // If the user changes the project selection so that currentProjectIndex is out of bounds:
  useEffect(() => {
    if (selectedProjects.length > 0 && currentProjectIndex >= selectedProjects.length) {
      setCurrentProjectIndex(0);
    }
  }, [selectedProjects, currentProjectIndex]);
  
  // Get the full list of members for a team from ConfigData
  const getTeamMembersList = (teamName: string) => {
    const selectedTeamData = ConfigData.TeamList.find((t) => t['Team Name'] === teamName);
    if (selectedTeamData && selectedTeamData.Members) {
      return selectedTeamData.Members.map(
        (member: any) => `${member.Name}${member.Loc ? ` (${member.Loc})` : ''}`
      );
    }
    return [];
  };
  
  // Filtered members for the activeTeam
  const fullMemberList = activeTeam ? getTeamMembersList(activeTeam) : [];
  const filteredMemberList = fullMemberList.filter((m) =>
    m.toLowerCase().includes(memberSearchText.toLowerCase())
  );
  
  // -----------------------
  //       Handlers
  // -----------------------
  // Add new org
  const handleAddNewOrg = () => {
    if (newOrgName.trim()) {
      setOrganizations((prev) => [...prev, newOrgName.trim()]);
      setSelectedOrg(newOrgName.trim());
      setNewOrgName('');
      setOpenNewOrgDialog(false);
      showSnackbar(`Organization "${newOrgName.trim()}" has been added successfully`, 'success');
    }
  };
  
  // Toggle project selection
  const handleProjectToggle = (project: string) => {
    setSelectedProjects((prev) => {
      if (prev.includes(project)) {
        // Removing
        const updated = prev.filter((p) => p !== project);
        
        // Also remove the project from projectTeams
        setProjectTeams((prevTeams) => {
          const copy = { ...prevTeams };
          delete copy[project];
          return copy;
        });
        
        // And remove the project from teamMembers
        setTeamMembers((prevMembers) => {
          const copy = { ...prevMembers };
          delete copy[project];
          return copy;
        });
        
        return updated;
      } else {
        return [...prev, project];
      }
    });
  };
  
  // Toggle team selection for a project
  const handleTeamCheckbox = (team: string, project: string) => {
    setProjectTeams((prev) => {
      const alreadySelected = prev[project] || [];
      let updatedTeams: string[];
      
      if (alreadySelected.includes(team)) {
        // If already selected, remove it
        updatedTeams = alreadySelected.filter((t) => t !== team);
        
        // Clear members for this team if removed
        setTeamMembers((prevMembers) => {
          const projectMembers = { ...(prevMembers[project] || {}) };
          delete projectMembers[team];
          
          return {
            ...prevMembers,
            [project]: projectMembers
          };
        });
        
        // If that team was the active one, clear it
        if (team === activeTeam) {
          setActiveTeam('');
        }
      } else {
        // Otherwise, add the team
        updatedTeams = [...alreadySelected, team];
        
        // If we add the team, also ensure it has an entry in teamMembers
        setTeamMembers((prevMembers) => {
          const projectMembers = { ...(prevMembers[project] || {}) };
          if (!projectMembers[team]) {
            projectMembers[team] = [];
          }
          
          return {
            ...prevMembers,
            [project]: projectMembers
          };
        });
        
        // Make it the active team to see member selection immediately
        setActiveTeam(team);
      }
      
      return {
        ...prev,
        [project]: updatedTeams,
      };
    });
  };
  
  // If the user clicks the label (the row) for a team
  const handleSetActiveTeam = (team: string) => {
    // If the team isn't selected yet, let's select it
    if (!currentProjectTeams.includes(team)) {
      handleTeamCheckbox(team, currentProject);
    } else {
      // If it is already selected, just set it as active
      setActiveTeam(team);
    }
  };
  
  // Toggle team member - now project specific
  const handleTeamMemberToggle = (member: string, team: string, project: string) => {
    setTeamMembers((prev) => {
      const projectMembers = { ...(prev[project] || {}) };
      const teamMembers = projectMembers[team] || [];
      
      if (teamMembers.includes(member)) {
        projectMembers[team] = teamMembers.filter((m) => m !== member);
      } else {
        projectMembers[team] = [...teamMembers, member];
      }
      
      return {
        ...prev,
        [project]: projectMembers
      };
    });
  };
  
  // Select all / Deselect all members - now project specific
  const handleToggleAllMembers = (team: string, project: string) => {
    const isCurrentlySelectAll = selectAllStatus[project]?.[team] || false;
    const allTeamMembers = getTeamMembersList(team);
    
    setTeamMembers((prev) => {
      const projectMembers = { ...(prev[project] || {}) };
      
      projectMembers[team] = isCurrentlySelectAll ? [] : allTeamMembers;
      
      return {
        ...prev,
        [project]: projectMembers
      };
    });
    
    setSelectAllStatus((prev) => {
      const projectStatus = { ...(prev[project] || {}) };
      projectStatus[team] = !isCurrentlySelectAll;
      
      return {
        ...prev,
        [project]: projectStatus
      };
    });
  };
  
  // Tabs for switching projects
  const handleProjectTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentProjectIndex(newValue);
    setActiveTeam('');
  };
  
  // Step navigation
  const handleNext = () => {
    if (isStepValid()) {
      if (activeStep === steps.length - 1) {
        // Save
        saveConfiguration();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    } else {
      showValidationErrors();
    }
  };
  
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  // -----------------------
  //       Validation
  // -----------------------
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
        // Must have at least one team for each selected project,
        // and each selected team must have at least one member
        const eachProjectHasTeam = selectedProjects.every(
          (project) => (projectTeams[project]?.length || 0) > 0
        );
        
        const eachTeamHasMembers = selectedProjects.every((project) => {
          const teams = projectTeams[project] || [];
          return teams.every((team) => (teamMembers[project]?.[team]?.length || 0) > 0);
        });
        
        if (!eachProjectHasTeam || !eachTeamHasMembers) {
          errorMessage =
            'Each project must have at least one team, and each team must have at least one member.';
        }
        break;
      default:
        break;
    }
    if (errorMessage) {
      showSnackbar(errorMessage, 'warning');
    }
  };
  
  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return selectedOrg !== '';
      case 1:
        return selectedProjects.length > 0;
      case 2:
        // Make sure each project has >= 1 team
        // and each selected team has >= 1 member
        const eachProjectHasTeam = selectedProjects.every(
          (project) => (projectTeams[project]?.length || 0) > 0
        );
        
        const eachTeamHasMembers = selectedProjects.every((project) => {
          const teams = projectTeams[project] || [];
          return teams.every((team) => (teamMembers[project]?.[team]?.length || 0) > 0);
        });
        
        return eachProjectHasTeam && eachTeamHasMembers;
      default:
        return true;
    }
  };
  
  const isProjectValid = (project: string): boolean => {
    const teams = projectTeams[project] || [];
    if (teams.length === 0) return false;
    
    return teams.every((team) => (teamMembers[project]?.[team]?.length || 0) > 0);
  };
  
  const isTeamValid = (team: string, project: string): boolean => {
    return (teamMembers[project]?.[team]?.length || 0) > 0;
  };
  
  // -----------------------
  //    Saving / Deleting
  // -----------------------
  const saveConfiguration = () => {
    // Build the projects -> teams -> members mapping
    const projectsMap: Record<string, { teams: string[]; members: Record<string, string[]> }> = {};
    
    selectedProjects.forEach((project) => {
      const teamsForProject = projectTeams[project] || [];
      const membersForTeams: Record<string, string[]> = {};
      
      teamsForProject.forEach((team) => {
        membersForTeams[team] = teamMembers[project]?.[team] || [];
      });
      
      projectsMap[project] = {
        teams: teamsForProject,
        members: membersForTeams,
      };
    });
    
    const newMapping: Mapping = {
      organization: selectedOrg,
      projects: projectsMap,
      timestamp: Date.now(),
    };
    
    const updatedMappings = [...savedMappings, newMapping];
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
    setActiveTeam('');
    setCurrentProjectIndex(0);
    setSelectAllStatus({});
  };
  
  const handleDeleteMapping = (timestamp: number) => {
    const updated = savedMappings.filter((m) => m.timestamp !== timestamp);
    localStorage.setItem('adminMappings', JSON.stringify(updated));
    setSavedMappings(updated);
    showSnackbar('Configuration deleted successfully', 'success');
  };
  
  // -----------------------
  //      UI Helpers
  // -----------------------
  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  return (
    <Box>
      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Step 1: Organization */}
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
                  {organizations.map((org) => (
                    <MenuItem key={org} value={org}>
                      {org}
                    </MenuItem>
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
                      (sum, { teams }) => sum + teams.length,
                      0
                    );
                    return (
                      <Card key={index} variant="outlined" sx={{ width: 280 }}>
                        <CardHeader
                          title={mapping.organization}
                          subheader={`Created: ${new Date(
                            mapping.timestamp
                          ).toLocaleDateString()}`}
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
        
        {/* Step 2: Projects */}
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
                endAdornment: !!projectSearchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setProjectSearchText('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Selection Summary */}
            {selectedProjects.length > 0 && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.light, 0.1),
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Selected Projects ({selectedProjects.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProjects.map((project) => (
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
            <Paper
              sx={{
                maxHeight: 300,
                overflow: 'auto',
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <FormGroup>
                {filteredProjects.map((project) => (
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
        
        {/* Step 3: Teams & Members (merged) */}
        {activeStep === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Select Teams & Members
            </Typography>
            
            {/* Project Tabs */}
            <Tabs
              value={currentProjectIndex}
              onChange={handleProjectTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              {selectedProjects.map((project, index) => {
                const teamsCount = projectTeams[project]?.length || 0;
                const valid = isProjectValid(project);
                return (
                  <Tab
                    key={project}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {project}
                        <Badge badgeContent={teamsCount} color="primary" sx={{ ml: 1 }} />
                        {valid ? (
                          <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />
                        ) : teamsCount === 0 ? (
                          <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                        ) : null}
                      </Box>
                    }
                    id={`project-tab-${index}`}
                  />
                );
              })}
            </Tabs>
            
            {/* Content for the current Project */}
            {currentProject && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Project: {currentProject} ({currentProjectIndex + 1}/{selectedProjects.length})
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                  {/* Left Column: Teams */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Teams
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
                        endAdornment: !!teamSearchText && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setTeamSearchText('')}>
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    {/* List of Teams */}
                    <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                      <FormGroup>
                        {filteredTeams.map((team) => (
                          <Box
                            key={team}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                              py: 0.5,
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                            }}
                          >
                            {/* Checkbox toggles selection */}
                            <Checkbox
                              checked={currentProjectTeams.includes(team)}
                              onChange={() => handleTeamCheckbox(team, currentProject)}
                              // Stop the label from toggling selection again
                              onClick={(ev) => ev.stopPropagation()}
                            />
                            
                            {/* Label sets activeTeam (or selects if not selected) */}
                            <Box
                              sx={{ ml: 1 }}
                              onClick={() => handleSetActiveTeam(team)}
                            >
                              <Typography variant="body2">
                                {team}
                                {activeTeam === team && ' (Active)'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </FormGroup>
                    </Paper>
                    
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      Selected {currentProjectTeams.length} team(s) for {currentProject}
                    </Typography>
                  </Box>
                  
                  {/* Right Column: Members for the activeTeam */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {activeTeam
                        ? `Members of "${activeTeam}" for project "${currentProject}"`
                        : 'Select a team to view its members'}
                    </Typography>
                    
                    {activeTeam && (
                      <>
                        {/* Member Search */}
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
                            endAdornment: !!memberSearchText && (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => setMemberSearchText('')}
                                >
                                  <ClearIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        
                        {/* Selected Members Summary */}
                        {getCurrentTeamMembers(currentProject, activeTeam).length > 0 && (
                          <Box
                            sx={{
                              mb: 2,
                              p: 2,
                              bgcolor: 'background.default',
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2" gutterBottom>
                              Selected Members ({getCurrentTeamMembers(currentProject, activeTeam).length}):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {getCurrentTeamMembers(currentProject, activeTeam).map((member) => (
                                <Chip
                                  key={member}
                                  label={member}
                                  onDelete={() => handleTeamMemberToggle(member, activeTeam, currentProject)}
                                  size="small"
                                  color="secondary"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {/* Select All / Deselect All */}
                        <Box sx={{ mb: 2 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleToggleAllMembers(activeTeam, currentProject)}
                          >
                            {selectAllStatus[currentProject]?.[activeTeam] ? 'Deselect All' : 'Select All'}
                          </Button>
                        </Box>
                        
                        {/* Members checkboxes */}
                        <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                          <FormGroup>
                            {filteredMemberList.map((member) => (
                              <FormControlLabel
                                key={member}
                                control={
                                  <Checkbox
                                    checked={getCurrentTeamMembers(currentProject, activeTeam).includes(member)}
                                    onChange={() => handleTeamMemberToggle(member, activeTeam, currentProject)}
                                  />
                                }
                                label={member}
                              />
                            ))}
                          </FormGroup>
                        </Paper>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
        
        {/* Step 4: Review */}
        {activeStep === 3 && (
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
            
            {/* Projects & Teams & Members */}
            {selectedProjects.map((project) => (
              <Paper key={project} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Project: {project}
                </Typography>
                
                {projectTeams[project]?.length > 0 ? (
                  <Box sx={{ ml: 2 }}>
                    {projectTeams[project].map((team) => (
                      <Box key={team} sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Team: {team}
                        </Typography>
                        {teamMembers[project]?.[team]?.length > 0 ? (
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Members ({teamMembers[project][team].length}):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {teamMembers[project][team].map((member) => (
                                <Chip key={member} label={member} size="small" variant="outlined" />
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
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: alpha(theme.palette.success.light, 0.1),
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body2">• Organization: {selectedOrg}</Typography>
              <Typography variant="body2">• Total Projects: {selectedProjects.length}</Typography>
              <Typography variant="body2">
                • Total Teams: {Object.values(projectTeams).flat().length}
              </Typography>
              <Typography variant="body2">
                • Total Team Members:{' '}
                {Object.entries(teamMembers).reduce((totalCount, [project, teams]) => {
                  return totalCount + Object.values(teams).reduce((count, members) => count + members.length, 0);
                }, 0)}
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
          color={activeStep === steps.length - 1 ? 'success' : 'primary'}
        >
          {activeStep === steps.length - 1 ? 'Save Configuration' : 'Next'}
        </Button>
      </Box>
      {/* Dialog for adding a new organization */}
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
          <Button onClick={handleAddNewOrg} variant="contained" disabled={!newOrgName.trim()}>
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

export default AdminConfig;
