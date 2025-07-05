import AOS from 'aos';
import 'aos/dist/aos.css';
import React, { useEffect } from 'react';

const TestAOS = () => {
    useEffect(() => {
        // Initialize AOS
        AOS.init();

        // Function to check 'will-change' property
        const checkWillChange = () => {
            // Get all elements with 'data-aos' attribute
            const aosElements = document.querySelectorAll('[data-aos]');
            
            console.log(`Found ${aosElements.length} elements with data-aos`);
            
            aosElements.forEach((element, index) => {
                // Add border to the element for visual feedback
                element.style.border = '2px dashed red';
                
                // Get the computed style
                const computedStyle = window.getComputedStyle(element);
                const willChange = computedStyle.getPropertyValue('will-change');
                
                console.log(`Element ${index + 1}:`, {
                    'data-aos': element.getAttribute('data-aos'),
                    'will-change': willChange,
                    'element': element.tagName,
                    'classes': element.className
                });
            });
        };

        // Run the check after AOS has been initialized
        setTimeout(checkWillChange, 100);
    }, []);

    return (
        <>
            {/* Style for will-change property */}
            <style>
                {`
                    [data-aos] {
                        will-change: transform, opacity !important;
                    }
                `}
            </style>

            {/* Test elements with data-aos */}
            <div data-aos="fade-up">Element 1</div>
            <div data-aos="fade-down">Element 2</div>
            <div data-aos="fade-left">Element 3</div>
        </>
    );
};

export default TestAOS;
