import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

const state = Annotation.Root({
    /** Messages */
    ...MessagesAnnotation.spec,
    
    /** Custom state */
    nextRepresentative: Annotation<string>,
});

export default state;