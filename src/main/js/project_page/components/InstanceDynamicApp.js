import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery'; // Import jQuery
import OpenAI from "openai";
import { getJSON } from "sonar-request";
//window.process = {};

const InstanceDynamicApp = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
//  const apiKey = process.env.OPENAI_API_KEY;
//  const [selectedVulnerability, setSelectedVulnerability] = useState(null);

//  const handleSidebarItemClick = (index) => {
//    setSelectedVulnerability(index);
//  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Perform GET request
        const response = await $.get("/api/sources/raw?key=sample-sonar:sonar-plugins/src/main/java/pl/piomin/sonar/plugin/CustomRulesDefinition.java");
        const message = `What are all the vulnerabilities contained in the following code, give them in details(paragraphs) in json format with these elements(for each vulnerability, the list is in the json property "vulnerabilities", don't invent additional properties) {Where is the risk : code snippet (line reference/number), What is the risk : (explain + cve reference if it apply), Assess the risk,  How can I fix it(with code examples)}:\n\n${response}`;

        const openai = new OpenAI({
          apiKey : "",
          dangerouslyAllowBrowser: true
        });
        // Pass the response to OpenAI API
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: message }],
          model: "ft:gpt-3.5-turbo-0125:personal:cyber1:8xDeA4Xh",
          response_format: { "type": "json_object" },
        });

        const data = completion.choices[0].message.content;
        const parsedData = JSON.parse(data);
        console.log(data);
        console.log(parsedData);

        // Update vulnerabilities state
        setVulnerabilities(parsedData["vulnerabilities"]);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sidebar = $(sidebarRef.current);
    const content = $(contentRef.current);

    // Populate sidebar with vulnerability titles
    vulnerabilities.forEach((vulnerability, index) => {
      const title = vulnerability["Where is the risk"];
      const sectionId = `vulnerability_${index}`;
      sidebar.append(`<div className="sidebar-item" data-section="${sectionId}">${title}</div>`);
    });


    // Populate content with vulnerability details
    vulnerabilities.forEach((vulnerability, index) => {
      const sectionId = `vulnerability_${index}`;
      const vulnerabilityHTML = `
        <div className="vulnerability" id="${sectionId}">
          <h2>${vulnerability["Where is the risk"]}</h2>
          <p><strong>What is the risk?</strong> ${vulnerability["What is the risk"]}</p>
          <p><strong>Assess the risk</strong> ${vulnerability["Assess the risk"]}</p>
          <p><strong>How can I fix it?</strong> ${vulnerability["How can I fix it"]}</p>
        </div>
      `;
      content.append(vulnerabilityHTML);
    });
  }, [vulnerabilities]);

  return (
    <div className="page page-limited">
      <div className="sidebar" ref={sidebarRef}></div>
      <div className="content" ref={contentRef}></div>
    </div>
  );
};

export default InstanceDynamicApp;

