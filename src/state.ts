import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

const state = Annotation.Root({
    /** Messages */
    ...MessagesAnnotation.spec,
    
    /** Custom state */
    next_action: Annotation<string>,
});

export default state;