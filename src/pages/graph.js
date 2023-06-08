import { Box, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { graphql, useStaticQuery } from 'gatsby';
import React, { useRef, useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';

import { ColorPaper, ColorPaperContent, ColorPaperTitle } from '../components/colorPaper';
import { GraphLayout, Seo } from '../components/layout';
import { colors } from '../theme/pastelColors';

// Color generator function
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createGraphData(data) {
  // Create arrays for nodes and links
  const nodes = [];
  const links = [];

  // Color map for groups
  const groupColors = {
    central: colors[1].main,
    work: colors[2].main,
    project: colors[3].main,
    service: colors[4].main,
    qualification: colors[5].main
  };

  // Color map for sub-groups (tags and categories)
  const subGroupColors = {};

  // Helper function to add node to nodes array
  function addNode(id, name, value, data, group) {
    const color =
      group in groupColors
        ? groupColors[group]
        : subGroupColors[group] || (subGroupColors[group] = getRandomColor());
    nodes.push({ id: id, name: name, value: value, data: data, group, color });
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
    'central'
  );
  addNode('projects', 'Projects', data.projects.length, { Name: 'Projects' }, 'project');
  addNode('work', 'Work', data.projects.length, { Name: 'Work' }, 'work');
  addNode('services', 'Services', data.services.length, { Name: 'Services' }, 'service');
  addNode(
    'qualifications',
    'Qualifications',
    data.qualifications.length,
    { Name: 'Qualifications' },
    'qualification'
  );

  // Connect central nodes to Chris Loidolt node
  addLink('central', 'projects');
  addLink('central', 'work');
  addLink('central', 'services');
  addLink('central', 'qualifications');

  // Iterate over projects, services, and qualifications and add them as nodes, linking them to central nodes
  for (const project of data.projects.nodes) {
    addNode(project.id, project.data.Title, 1, project.data, 'project');

    // Link projects to their tags
    for (const tag of project.data.Tags) {
      const tagId = `${tag}`;

      if (!nodes.find((node) => node.id === tagId)) {
        addNode(tagId, tag, 1, { Name: tag }, tagId);
        addLink('projects', tagId); // Link tag to central-project
      }

      addLink(tagId, project.id);
    }
  }

  for (const website of data.websites.nodes) {
    addNode(website.id, website.data.Name, 1, website.data, 'work');
    addLink('work', website.id);
  }

  for (const service of data.services.nodes) {
    addNode(service.id, service.data.Name, 1, service.data, 'service');
    addLink('services', service.id);
  }

  for (const qualification of data.qualifications.nodes) {
    addNode(qualification.id, qualification.data.Name, 1, qualification.data, 'qualification');

    // Link qualifications to their categories
    const categoryId = `${qualification.data.Category}`;

    if (!nodes.find((node) => node.id === categoryId)) {
      addNode(categoryId, { Name: qualification.data.Category }, categoryId);
      addLink('qualifications', categoryId); // Link category to central-qualification
    }

    addLink(categoryId, qualification.id);
  }

  return { nodes, links };
}

const GraphNavigation = ({ onGroupSelect }) => {
  return (
    <Box sx={{ position: 'fixed', top: 100, left: 40, zIndex: 1000 }}>
      <Stack spacing={1}>
        <Button variant={'contained'} onClick={() => onGroupSelect('projects')}>
          Projects
        </Button>
        <Button variant={'contained'} onClick={() => onGroupSelect('work')}>
          Work
        </Button>
        <Button variant={'contained'} onClick={() => onGroupSelect('services')}>
          Services
        </Button>
        <Button variant={'contained'} onClick={() => onGroupSelect('qualifications')}>
          Qualifications
        </Button>
      </Stack>
    </Box>
  );
};

const NodePreview = ({ nodeData }) => {
  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1001 }}>
      <ColorPaper color={colors[1]}>
        <ColorPaperTitle color={colors[1]} title={nodeData.data.Date} />
        <ColorPaperContent color={colors[1]}>
          <Box sx={{ width: { xs: '72vw', md: '50vw' }, height: { xs: '30vh', md: '50vh' } }}>
            <h2>{nodeData.name}</h2>
            <p>{nodeData.data.Date}</p>
            <p>{nodeData.data.Excerpt}</p>
            {/* Display more node data here */}
          </Box>
        </ColorPaperContent>
      </ColorPaper>
    </Box>
  );
};

const Graph = () => {
  const theme = useTheme();

  const fgRef = useRef();
  const [nodeData, setNodeData] = useState(null);

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

  const graphData = createGraphData(data);
  console.log(graphData);

  const handleGroupSelect = (groupId) => {
    setNodeData(null);

    const selectedNode = graphData.nodes.find((node) => node.id === groupId);

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

    // Set the clicked node data to the state
    console.log(node);
    setNodeData(node);
  };

  return (
    <GraphLayout color={colors[2]}>
      <GraphNavigation onGroupSelect={handleGroupSelect} />
      {nodeData && <NodePreview nodeData={nodeData} />}
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="id"
        nodeAutoColorBy="group"
        onNodeClick={handleNodeClick}
        backgroundColor={theme.palette.background.default}
      />
    </GraphLayout>
  );
};

export const Head = () => <Seo title="Public Services" />;

export default Graph;
