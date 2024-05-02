
import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery'; // Import jQuery
import OpenAI from "openai";
import { getJSON } from "sonar-request";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import VulnerabilityComponent from "./VulnerabilityComponent"

const InstanceDynamicApp = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const isVisible = "visible";
  useEffect(() => {
    sidebarRef.current.addEventListener('click', handleClick);
    return () => {
      sidebarRef.current.removeEventListener('click', handleClick);
    };
  }, []);

  const handleClick = (e) => {
    const target = e.target.closest("#justme");
    if(target) {
      console.log(e.target.getAttribute("data-section"));
      const sectionId = e.target.getAttribute("data-section");
      setSelectedSection(sectionId);
    };
  };


        async function fetchCodeFromURL(url) {
          try {
            const response = await $.get(url);
            return response;
          } catch (error) {
            console.error(`Error fetching code from ${url}: ${error}`);
            return null;
          }
        }

        async function fetchAllCodeSources() {
          const response = await $.get('/api/measures/component_tree?metricKeys=coverage&component=sample-sonar');
          const components = response.components;
          const codePromises = components.map(component => fetchCodeFromURL(`/api/sources/raw?key=${component.key}`));
          const codeResponses = await Promise.all(codePromises);
          const fullCodeSource = codeResponses.filter(code => code !== null).join('\n');
          return fullCodeSource;
        }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Perform GET request

        const fullcode = await fetchAllCodeSources();

        //const response = await $.get("/api/sources/raw?key=sample-sonar:sonar-plugins/src/main/java/pl/piomin/sonar/plugin/CustomRulesDefinition.java");
        const message = `based on cwe database give all the vulnerabilities contained in code i provide you :
        you must respect strictly the following instructions and give the same result for same code :
        the response must be a json containing one attribuet "vulnerabilities" that contains a list, and each element of list have these attributes (respect spelling, don't invent additional properties) {title, priority, category, where, risk, assess, fix}, here is the content each element must be:
        title : what to do (for example : review this "problem")in one short sentence,
        priority: high/medium/low,
        category : authentication/XSS .., (4 words max)
        where : full code snippet containing the vulnerability + (line reference/number),
        risk : (explain in detail + cve reference if it apply),
        assess : a guide on how to evaluate the risk (full paragraph),
        fix : explain step by step how to mitigate vuln if possible(with code examples)}:\n\n${fullcode}`;

        const openai = new OpenAI({
          apiKey : "",
          dangerouslyAllowBrowser: true
        });
        // Pass the response to OpenAI API
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: message }],
          model: "ft:gpt-3.5-turbo-0125:personal:cybersec2:9IHj0qtk",
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
      const title = vulnerability["title"];
      const sectionId = `vulnerability_${index}`;
      sidebar.append(`
	<li>
        <a>
          <button id="justme" className="sidebar-item" data-section="${sectionId}" style="background-color: white;border: 0px;padding: 16px;font-size: 14px; width: 100%; text-align: start;">${title}</button>
        </a>
      </li>
	`);
    });


  }, [vulnerabilities]);



  return (
	<div className="page page-limited">
      <div className={`sidebar ${isVisible ? 'visible' : 'hidden'}`} >
        <div className="sidebar-header-container">
          <div className="sidebar-header">
            <svg height="24" role="img" width="24">
              <g transform="translate(0, 0)">
                <g transform="translate(12, 12)">
                  <path d="M0,-12L0,-9Z" ></path>
                  <path d="M0,-12A12,12,0,1,1,0,12A12,12,0,1,1,0,-12M0,-9A9,9,0,1,0,0,9A9,9,0,1,0,0,-9Z" ></path>
                </g>
              </g>
            </svg>
          <div>
            <span >0.0%</span>
            <span >Security Hotspots Reviewed</span>
          </div>
          <div >
            <button aria-label="Filters" aria-controls="filter-hotspots-menu-dropdown" aria-expanded="false" aria-haspopup="menu" id="filter-hotspots-menu-trigger" role="button" class="filter-button" type="button">
              <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" >
                <path d="M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75Zm3 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path>
              </svg>
            </button>
          </div>
          </div>
        </div>
        <div className='horizontal-line '></div>
        <div className='sidebar-body-container'>
          <div>
            <div>
              <ButtonGroup variant="outlined" aria-label="Basic button group" className="radiogroup">
                <Button>To review</Button>
                <Button>Acknowledged</Button>
                <Button>Fixed</Button>
                <Button>Safe</Button>
              </ButtonGroup>
            </div>
          </div>
          <div className='horizontal-line '></div>
          <div className="sidebar-navigation-container">
            <div className='hotspot-number-container'>
              <span ><strong>264</strong> Security Hotspots </span>
            </div>
            <div class="sw-mt-8 sw-mb-4">
              <div class="sw-mb-4">
                <div class="sw-px-0 css-msveua efmrs8e0">
                  <div className="priority-filter-container">
                    <span><strong>Review priority:</strong></span>
                    <LabelImportantIcon className='high-label' />
                    High
                  </div>
                </div>
                <div>
                  <div className="vuln-type-container">
                    <div class="css-15ccv04 e1yk15991">
                      <button aria-controls="hotspot-category-HIGH-subnavigation-accordion" aria-expanded="true" id="hotspot-category-HIGH-subnavigation-accordion-button" class="type-button">
                        <div className="vuln-type-header">
                          <LabelImportantIcon className='high-label' />
                          <div>
                            Authentication
                          </div>
                          <span aria-label="162" class="css-i62nvh ez2fet90" role="status">162</span>
                        </div>
                      </button>
                      <div class="css-4t9nm1 e1yk15990"></div>
                      <section aria-labelledby="hotspot-category-HIGH-subnavigation-accordion-button" id="hotspot-category-HIGH-subnavigation-accordion">
                        <ul ref={sidebarRef}>
                        </ul>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div tabindex="-1" class="list-footer sw-body-sm sw-flex sw-items-center sw-justify-center css-8vsvg5">
              <span aria-live="polite" aria-busy="false">264 of 264 shown</span>
              <div class="sw-relative">
                <div class="sw-overflow-hidden sw-sr-only">
                  <div aria-live="polite" class="sw-ml-2 css-1m8hbac evaubyj1" role="status"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content">
        {vulnerabilities.map((vulnerability, index) => (
          <VulnerabilityComponent
          key={index}
          sectionId={`vulnerability_${index}`}
          vulnerability={vulnerability}
          isSelected={`vulnerability_${index}` === selectedSection}
          />
        ))}
      </div>
    </div>
  );
};

export default InstanceDynamicApp;

