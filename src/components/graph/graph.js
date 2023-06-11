import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { graphql, useStaticQuery } from 'gatsby';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import SpriteText from 'three-spritetext';

import { colors } from '../../theme/pastelColors';
import { getRandomColor } from '../../utils';
import { AboutCard, QualificationsCard } from '../about';
import { ContactCard } from '../contact';
import { GraphLayout, Seo } from '../layout';
import { ProjectPreview } from '../posts';
import { ServicesCard } from '../services';
import { WebsiteCard } from '../work';
import CategoryCard from './categoryCard';
import GraphControls from './graphControls';
import GraphNavigation from './graphNavigation';

// Color map for groups
const groupColors = {
  all: colors[2],
  about: colors[3],
  contact: colors[0],
  projects: colors[6],
  work: colors[7],
  services: colors[8],
  qualifications: colors[11]
};

// Color map for sub-groups (categories)
const subGroupColors = {
  websites: colors[2],
  shop: colors[3],
  workshop: colors[4],
  software: colors[5],
  media: colors[6],
  frontend: colors[7],
  backend: colors[8],
  aviation: colors[9],
  scuba: colors[10],
  skydiving: colors[11],
  radio: colors[12],
  '3dprinting': colors[12],
  cnc: colors[13],
  woodworking: colors[14],
  electronics: colors[15],
  restoration: colors[16],
  machines: colors[17],
  outdoors: colors[19],
  textiles: colors[20],
  laser: colors[21],
  metalworking: colors[22],
  house: colors[23],
  other: colors[18]
};

const categoryCounts = {};

function createGraphData(data) {
  // Create arrays for nodes and links
  const nodes = [];
  const links = [];

  // Helper function to add node to nodes array
  function addNode(id, name, value, data, group, parent) {
    const color =
      group in groupColors
        ? groupColors[group.toLowerCase()]
        : subGroupColors[group.toLowerCase()] ||
        (subGroupColors[group.toLowerCase()] = getRandomColor());

    // Push to nodes for graph
    nodes.push({
      id: id,
      name: name,
      value: value,
      data: data,
      group: group,
      color: color,
      parent: parent
    });
  }

  // Helper function to add link to links array
  function addLink(source, target) {
    links.push({ source, target });
  }

  console.log(data);

  // Create primary nodes
  addNode(
    'about',
    'Chris Loidolt',
    data.projects.nodes.length + data.services.nodes.length + data.qualifications.nodes.length,
    { Name: 'Chris Loidolt' },
    'about',
    null
  );
  addNode('contact', 'Contact', 10, { Name: 'Contact' }, 'contact', null);
  addNode(
    'projects',
    'Projects',
    data.projects.nodes.length,
    { Name: 'Projects', nodeType: 'category' },
    'projects',
    null
  );
  addNode(
    'work',
    'Work',
    data.websites.nodes.length,
    { Name: 'Work', nodeType: 'category' },
    'work',
    null
  );
  addNode(
    'websites',
    'Websites',
    data.websites.nodes.length,
    { Name: 'Websites', nodeType: 'category' },
    'work',
    'work'
  );
  addNode('shop', 'Shop', 10, { Name: 'Shop', nodeType: 'category' }, 'work', 'work');
  addNode(
    'services',
    'Services',
    data.services.nodes.length,
    { Name: 'Services', nodeType: 'category' },
    'services',
    null
  );
  addNode(
    'qualifications',
    'Qualifications',
    data.qualifications.nodes.length,
    { Name: 'Qualifications', nodeType: 'category' },
    'qualifications',
    null
  );

  // Connect hub nodes
  addLink('about', 'contact');
  addLink('about', 'projects');
  addLink('about', 'work');
  addLink('work', 'websites');
  addLink('work', 'shop');
  addLink('about', 'services');
  addLink('about', 'qualifications');

  // Iterate over projects, services, and qualifications and add them as nodes, linking them to hub nodes
  for (const project of data.projects.nodes) {
    addNode(project.id, project.data.Title, 1, project.data, 'projects', 'projects');

    // Link projects to their categories
    for (const category of project.data.Categories) {
      let categoryId = `${category}`;

      if (categoryId === 'Work') {
        categoryId = 'shop';
      }

      if (!nodes.find((node) => node.id === categoryId)) {
        // If this is a new category, start the count at 1
        categoryCounts[categoryId] = 1;

        // Add category node if it doesn't exist
        addNode(
          categoryId,
          category,
          categoryCounts[categoryId],
          { Name: category, nodeType: 'category' },
          categoryId,
          'projects'
        );
        addLink('projects', categoryId); // Link category to projects
        addLink(categoryId, project.id);
      } else {
        // If the category node already exists, increment the count and update the node's value
        categoryCounts[categoryId]++;
        const categoryNode = nodes.find((node) => node.id === categoryId);
        categoryNode.value = categoryCounts[categoryId];
      }

      addLink(categoryId, project.id);
    }
  }

  for (const website of data.websites.nodes) {
    addNode(website.id, website.data.Name, 1, website.data, 'websites', 'work');
    addLink('websites', website.id);
  }

  for (const service of data.services.nodes) {
    addNode(service.id, service.data.Name, 1, service.data, 'services', 'services');
    addLink('services', service.id);
  }

  for (const qualification of data.qualifications.nodes) {
    addNode(
      qualification.id,
      qualification.data.Name,
      1,
      qualification.data,
      'qualifications',
      'qualifications'
    );

    // Link qualifications to their categories
    const categoryId = `${qualification.data.Category}`;

    if (categoryId in categoryCounts) {
      categoryCounts[categoryId]++;
    } else {
      categoryCounts[categoryId] = 1;
    }

    // Add category node if it doesn't exist
    if (!nodes.find((node) => node.id === categoryId)) {
      addNode(
        categoryId,
        qualification.data.Category,
        categoryCounts[categoryId], // use the category count as the value for the node
        { Name: qualification.data.Category, nodeType: 'category' },
        categoryId,
        'qualifications'
      );
      addLink('qualifications', categoryId); // Link category to qualifications
    } else {
      // If the category node already exists, update its value
      const existingNode = nodes.find((node) => node.id === categoryId);
      existingNode.value = categoryCounts[categoryId];
    }

    addLink(categoryId, qualification.id);
  }

  return { nodes, links };
}

const Graph = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const fgRef = useRef();
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
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
            Title
            Path
            Excerpt
            Categories
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
            Summary
            Category
            Categories
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

    if (groupId === null || groupId === 'all') {
      // Reset the camera position to the default position when groupId is null
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 1200 }, null, 1000);
      setAutoRotate(false);
      setSelectedGroup(null);
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
    const distance = matches ? 200 : 100;
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
    //console.log(node);
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

  //console.log(nodeData);
  //console.log(selectedGroup);

  return (
    <GraphLayout color={colors[2]}>
      <GraphNavigation
        groupColors={groupColors}
        onGroupSelect={handleGroupSelect}
        selectedGroup={selectedGroup}
      />
      <GraphControls
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        setShowLabels={setShowLabels}
        showLabels={showLabels}
        nodeData={nodeData}
        handlePrevNode={handlePrevNode}
        handleCloseNode={handleCloseNode}
        handleNextNode={handleNextNode}
      />
      {nodeData && nodeData.data && nodeData.data.nodeType === 'category' && (
        <CategoryCard nodeData={nodeData} />
      )}
      {nodeData && nodeData.group === 'projects' && nodeData.parent && (
        <ProjectPreview nodeData={nodeData} />
      )}
      {nodeData && nodeData.group === 'about' && <AboutCard color={groupColors.about} />}
      {selectedGroup && selectedGroup === 'about' && <AboutCard color={groupColors.about} />}
      {nodeData && nodeData.group === 'contact' && <ContactCard color={groupColors.contact} />}
      {selectedGroup && selectedGroup === 'contact' && <ContactCard color={groupColors.contact} />}
      {nodeData && nodeData.group === 'websites' && nodeData.parent && (
        <WebsiteCard nodeData={nodeData} />
      )}
      {nodeData && nodeData.group === 'services' && nodeData.parent && (
        <ServicesCard nodeData={nodeData} />
      )}
      {nodeData && nodeData.group === 'qualifications' && nodeData.parent && (
        <QualificationsCard nodeData={nodeData} />
      )}
      <ForceGraph3D
        ref={fgRef}
        graphData={{ nodes, links }}
        nodeLabel="name"
        nodeVal="value"
        nodeAutoColorBy="group"
        linkAutoColorBy="group"
        linkWidth={1}
        onNodeClick={handleNodeClick}
        backgroundColor={theme.palette.background.default}
        minZoom={0.5}
        maxZoom={2}
        enableNodeDrag={false}
        nodeResolution={matches ? 16 : 32}
        nodeRelSize={matches ? 6 : 4}
        nodeOpacity={0.95}
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
        nodeThreeObject={(node) => {
          // Conditionally render SpriteText based on showLabels and selectedGroup
          if (
            showLabels &&
            (selectedGroup == null ||
              node.id === selectedGroup ||
              node.group === selectedGroup ||
              node.parent === selectedGroup)
          ) {
            const sprite = new SpriteText(node.name);
            sprite.color = node.color.light;
            sprite.textHeight = 0.1; // Adjust as needed.
            sprite.backgroundColor = `${node.color.paperBackground}F7`; // Try a semi-transparent black color as background
            sprite.borderRadius = 4;
            sprite.borderWidth = 0.5;
            sprite.borderColor = node.color.light;
            sprite.padding = 5; // Add some padding around your text

            // Implement stroke
            sprite.strokeColor = node.color.light;
            sprite.strokeWidth = 0.5; // Adjust as needed

            return sprite;
          }
        }}
      />
    </GraphLayout>
  );
};

export const Head = () => <Seo title="Loidolt Design | Chris Loidolt" />;

export default Graph;
