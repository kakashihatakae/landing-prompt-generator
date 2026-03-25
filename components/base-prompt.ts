const base_prompt = 'If user adds css style classes to be more precise about the styling of the website, use those exact classes inside the generate prompt.\
 Do not shorten the css classes, use them as is. Make sure to add all the attributes of the css classes and not just the name. \
 Feel free to enhance the css classes to make it look better. Name this class all over the prompt so the AI coding agent will know what theme to use \
 for all aspects of the project. \
 Following is the prompt written by the user:\n\n';

export default base_prompt;