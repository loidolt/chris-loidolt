import { ArrowBack, ArrowForward, Close, StopCircle, ThreeSixty } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { graphql, useStaticQuery } from 'gatsby';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';

import { colors } from '../../theme/pastelColors';
import { QualificationsCard } from '../about';
import { GraphLayout, Seo } from '../layout';
import { ProjectPreview } from '../posts';
import { ServicesCard } from '../services';
import { WebsiteCard } from '../work';

// Color generator function
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Color map for groups
const groupColors = {
  central: colors[3],
  project: colors[6],
  work: colors[7],
  service: colors[8],
  qualification: colors[11]
};

// Color map for sub-groups (tags and categories)
const subGroupColors = {};

function createGraphData(data) {
  // Create arrays for nodes and links
  const nodes = [];
  const links = [];

  // Helper function to add node to nodes array
  function addNode(id, name, value, data, group, parent) {
    const color =
      group in groupColors
        ? groupColors[group]
        : subGroupColors[group] || (subGroupColors[group] = getRandomColor());
    nodes.push({ id: id, name: name, value: value, data: data, group, color, parent });
  }

  // Helper function to add link to links array
  function addLink(source, target) {
    links.push({ source, target });
  }

  // Create central nodes
  addNode(
    'central',
    'Chris Loidolt',
    data.projects.length + data.services.length + data.qualifications.length,
    { Name: 'Chris Loidolt' },
    'central',
    null
  );
  addNode('projects', 'Projects', data.projects.length, { Name: 'Projects' }, 'project', null);
  addNode('work', 'Work', data.projects.length, { Name: 'Work' }, 'work', null);
  addNode('websites', 'Websites', data.projects.length, { Name: 'Websites' }, 'work', 'work');
  addNode('services', 'Services', data.services.length, { Name: 'Services' }, 'service', null);
  addNode(
    'qualifications',
    'Qualifications',
    data.qualifications.length,
    { Name: 'Qualifications' },
    'qualification',
    null
  );

  // Connect central nodes to Chris Loidolt node
  addLink('central', 'projects');
  addLink('central', 'work');
  addLink('work', 'websites');
  addLink('central', 'services');
  addLink('central', 'qualifications');

  // Iterate over projects, services, and qualifications and add them as nodes, linking them to central nodes
  for (const project of data.projects.nodes) {
    addNode(project.id, project.data.Title, 1, project.data, 'project', 'projects');

    // Link projects to their tags
    for (const tag of project.data.Tags) {
      const tagId = `${tag}`;

      if (!nodes.find((node) => node.id === tagId)) {
        addNode(tagId, tag, 1, { Name: tag }, tagId, 'projects');
        addLink('projects', tagId); // Link tag to central-project
      }

      addLink(tagId, project.id);
    }
  }

  for (const website of data.websites.nodes) {
    addNode(website.id, website.data.Name, 1, website.data, 'website', 'work');
    addLink('websites', website.id);
  }

  for (const service of data.services.nodes) {
    addNode(service.id, service.data.Name, 1, service.data, 'service', 'services');
    addLink('services', service.id);
  }

  for (const qualification of data.qualifications.nodes) {
    addNode(
      qualification.id,
      qualification.data.Name,
      1,
      qualification.data,
      'qualification',
      'qualifications'
    );

    // Link qualifications to their categories
    const categoryId = `${qualification.data.Category}`;

    if (!nodes.find((node) => node.id === categoryId)) {
      addNode(
        categoryId,
        qualification.data.Category,
        { Name: qualification.data.Category },
        categoryId,
        'qualifications'
      );
      addLink('qualifications', categoryId); // Link category to central-qualification
    }

    addLink(categoryId, qualification.id);
  }

  return { nodes, links };
}

const GraphNavigation = ({ onGroupSelect }) => {
  return (
    <Box sx={{ position: 'fixed', top: 80, left: 20, zIndex: 1000 }}>
      <Stack spacing={1}>
        <Button variant={'contained'} onClick={() => onGroupSelect(null)}>
          All
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('projects')}
          sx={{
            backgroundColor: groupColors.project.light,
            '&:hover': {
              backgroundColor: groupColors.project.dark
            }
          }}>
          Projects
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('work')}
          sx={{
            backgroundColor: groupColors.work.light,
            '&:hover': {
              backgroundColor: groupColors.work.dark
            }
          }}>
          Work
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('services')}
          sx={{
            backgroundColor: groupColors.service.light,
            '&:hover': {
              backgroundColor: groupColors.service.dark
            }
          }}>
          Services
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('qualifications')}
          sx={{
            backgroundColor: groupColors.qualification.light,
            '&:hover': {
              backgroundColor: groupColors.qualification.dark
            }
          }}>
          Qualifications
        </Button>
      </Stack>
    </Box>
  );
};

const GraphControls = ({
  autoRotate,
  setAutoRotate,
  nodeData,
  handleNextNode,
  handleCloseNode,
  handlePrevNode
}) => {
  return (
    <Box sx={{ position: 'fixed', top: 80, right: 20, zIndex: 1000 }}>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
        <Tooltip title={autoRotate ? 'Stop Rotation' : 'Start Rotation'}>
          <IconButton variant={'contained'} onClick={() => setAutoRotate(!autoRotate)}>
            {autoRotate ? <StopCircle /> : <ThreeSixty />}
          </IconButton>
        </Tooltip>
        {nodeData && (
          <>
            <Tooltip title={'Previous Node'}>
              <IconButton variant={'contained'} onClick={() => handleNextNode(nodeData.id)}>
                {<ArrowBack />}
              </IconButton>
            </Tooltip>
            <Tooltip title={'Close Node'}>
              <IconButton variant={'contained'} onClick={() => handleCloseNode()}>
                {<Close />}
              </IconButton>
            </Tooltip>
            <Tooltip title={'Next Node'}>
              <IconButton variant={'contained'} onClick={() => handlePrevNode(nodeData.id)}>
                {<ArrowForward />}
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </Box>
  );
};

const Graph = () => {
  const theme = useTheme();

  const fgRef = useRef();
  const [autoRotate, setAutoRotate] = useState(false);
  const [nodeData, setNodeData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const data = useStaticQuery(graphql`
    query graphNodes {
      projects: allAirtable(
        filter: { data: { Status: { eq: "Published" } }, table: { eq: "Posts" } }
        sort: { data: { Date: DESC } }
      ) {
        nodes {
          data {
            Tags
            Title
            Path
            Excerpt
            Date(formatString: "DD MMMM YYYY")
            Cover_Image {
              localFiles {
                childImageSharp {
                  gatsbyImageData(width: 600, quality: 50)
                }
              }
            }
          }
          id
        }
      }
      websites: allAirtable(
        filter: { table: { eq: "Websites" }, data: { Status: { eq: "Published" } } }
      ) {
        nodes {
          data {
            Name
            Status_URL
            URL
            Summary
            Image {
              localFiles {
                childImageSharp {
                  gatsbyImageData
                }
                name
                publicURL
              }
            }
            Status
          }
          id
        }
      }
      services: allAirtable(
        filter: { table: { eq: "Services" }, data: { Status: { eq: "Published" } } }
      ) {
        nodes {
          data {
            Name
            More_Info
            Subtitle
            Summary
            URL
            Image {
              localFiles {
                childImageSharp {
                  gatsbyImageData
                }
                name
                publicURL
              }
            }
          }
          id
        }
      }
      qualifications: allAirtable(filter: { table: { eq: "Qualifications" } }) {
        nodes {
          data {
            Name
            Category
            Level
            Type
            More_Info
          }
          id
        }
      }
    }
  `);

  const { nodes, links } = useMemo(() => createGraphData(data), [data]);

  const rotationSpeed = 0.002;

  const handleGroupSelect = (groupId) => {
    setNodeData(null);
    setSelectedGroup(groupId);

    if (groupId === null) {
      // Reset the camera position to the default position when groupId is null
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 1200 }, null, 1000);
      setAutoRotate(false);
      return;
    }

    const selectedNode = nodes.find((node) => node.id === groupId);

    if (selectedNode) {
      const distance = 600;
      const distRatio = 1 + distance / Math.hypot(selectedNode.x, selectedNode.y, selectedNode.z);

      fgRef.current.cameraPosition(
        {
          x: selectedNode.x * distRatio,
          y: selectedNode.y * distRatio,
          z: selectedNode.z * distRatio
        },
        selectedNode,
        1000
      );
    }

    setAutoRotate(false);
  };

  const handleNodeClick = (node) => {
    // Aim at node from outside it
    const distance = 60;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      3000 // duration in ms
    );

    setAutoRotate(false);

    if (node.parent !== selectedGroup) {
      setSelectedGroup(node.parent);
    }

    // Set the clicked node data to the state
    console.log(node);
    setNodeData(node);
  };

  // Navigate to the next node in the graph
  const handleNextNode = (id) => {
    const nodeIndex = nodes.findIndex((node) => node.id === id);
    const nextNode = nodes[nodeIndex + 1];

    if (nextNode) {
      handleNodeClick(nextNode);
    }
  };

  // Navigate to the previous node in the graph
  const handlePrevNode = (id) => {
    const nodeIndex = nodes.findIndex((node) => node.id === id);
    const nextNode = nodes[nodeIndex - 1];

    if (nextNode) {
      handleNodeClick(nextNode);
    }
  };

  // Close the node data
  const handleCloseNode = () => {
    setNodeData(null);
  };

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      if (fgRef.current && autoRotate) {
        const currentCameraPosition = fgRef.current.cameraPosition();
        fgRef.current.cameraPosition(
          {
            x:
              currentCameraPosition.x * Math.cos(rotationSpeed) +
              currentCameraPosition.z * Math.sin(rotationSpeed),
            z:
              currentCameraPosition.z * Math.cos(rotationSpeed) -
              currentCameraPosition.x * Math.sin(rotationSpeed),
            y: currentCameraPosition.y
          },
          undefined,
          0
        );
      }
    }, 1000 / 60); // Approximate 60 FPS

    return () => clearInterval(rotationInterval); // Clean up the interval on unmount
  }, [autoRotate]);

  return (
    <GraphLayout color={colors[2]}>
      <GraphNavigation onGroupSelect={handleGroupSelect} />
      <GraphControls
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        nodeData={nodeData}
        handlePrevNode={handlePrevNode}
        handleCloseNode={handleCloseNode}
        handleNextNode={handleNextNode}
      />
      {nodeData && nodeData.group === 'project' && (
        <ProjectPreview
          nodeData={nodeData}
          handleNextNode={handleNextNode}
          handleCloseNode={handleCloseNode}
          handlePrevNode={handlePrevNode}
        />
      )}
      {nodeData && nodeData.group === 'website' && <WebsiteCard nodeData={nodeData} />}
      {nodeData && nodeData.group === 'service' && <ServicesCard nodeData={nodeData} />}
      {nodeData && nodeData.group === 'qualification' && <QualificationsCard nodeData={nodeData} />}
      <ForceGraph3D
        ref={fgRef}
        graphData={{ nodes, links }}
        nodeLabel="name"
        nodeAutoColorBy="group"
        onNodeClick={handleNodeClick}
        backgroundColor={theme.palette.background.default}
        minZoom={0.5}
        maxZoom={2}
        enableNodeDrag={false}
        nodeResolution={16}
        nodeColor={
          (node) =>
            selectedGroup == null ||
              node.id === selectedGroup ||
              node.group === selectedGroup ||
              node.parent === selectedGroup
              ? node.color.main
              : 'rgba(255, 255, 255, 0.5)' // use faded color for non-selected nodes
        }
        linkColor={
          (link) =>
            selectedGroup == null ||
              link.source.id === selectedGroup ||
              link.target.id === selectedGroup ||
              link.source.group === selectedGroup ||
              link.target.group === selectedGroup ||
              link.source.parent === selectedGroup ||
              link.target.parent === selectedGroup
              ? 'rgba(255, 255, 255, 1)' // use solid color for links in the selected group
              : 'rgba(255, 255, 255, 0.1)' // use faded color for other links
        }
      />
    </GraphLayout>
  );
};

export const Head = () => <Seo title="Loidolt Design | Chris Loidolt" />;

export default Graph;
