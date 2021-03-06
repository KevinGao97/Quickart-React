import { ALL_POSTS_LOADED, SINGLE_POST_LOADED,  CREATE_POST_SUCCESS, CREATE_POST_FAILED, LIKE_POST_SUCCESS, LIKE_POST_FAILED, DISLIKE_POST_SUCCESS,  DISLIKE_POST_FAILED, DELETE_POST_SUCESS, DELETE_POST_FAILED } from '../constants';

const initialState = [
    //We make the state a list so we can store a list of all alerts 
];

const postsReducer = (state = initialState, action) => {
    
    switch(action.type) {
        case ALL_POSTS_LOADED:
            console.log("Loaded All Posts Success");
            return action.data;
            
        case SINGLE_POST_LOADED:
            console.log("Loaded One Post Sucess");
            return action.data

        case CREATE_POST_SUCCESS:
            console.log("Create Post Success");
            return [...state];

        case CREATE_POST_FAILED:
            console.log("Create Post Failed");
            return [...state];

        case LIKE_POST_SUCCESS:
            console.log("Like Post Success");
            return [...state];

        case LIKE_POST_FAILED:
            console.log("Like Post Failed");
            return [...state];

        case DISLIKE_POST_SUCCESS:
            console.log("Dislike Post Success");
            return [...state];

        case DISLIKE_POST_FAILED:
            console.log("Dislike Post Failed");
            return [...state];

        case DELETE_POST_SUCESS:
            console.log("Delete Post Sucess")
            // return [...state, action.data];
            return action.data;
            
        case DELETE_POST_FAILED:
            console.log("Delete Post Failed")
            return action.data;
        default:
            return state;
    }
};

export default postsReducer;