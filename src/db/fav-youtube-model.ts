import mongoose, { Schema , model } from "mongoose";


export interface IFavYoutubeSchema {
    title: string;
    decription: string;
    thumbnailURL?: string;
    watched: boolean;
    youtubeName: string;
}

const FavYoutuberSchema = new Schema<IFavYoutubeSchema>({
    title: {
        type: String,
        required: true,
    },
    decription: {
        type: String,
        required: true,
    },
    thumbnailURL: {
        type: String,
        default: "https://getuikit.com/v2/docs/images/placeholder_600x400.svg",
        required: false,
    },
    watched: {
        type: Boolean,
        default: false,
        required: true,
    },
    youtubeName: {
        type: String,
        required: true,
    },
})

const FavYoutuberModel = model('fav-youtuber-model', FavYoutuberSchema)

export default FavYoutuberModel