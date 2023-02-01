import React from 'react';
import {IonSlide} from "@ionic/react";
import {Link} from "react-router-dom";

export const CategorySlide = ({name, path, image}) => (

    <IonSlide>
        <Link to={path} className="non-link">
            <img src={image} alt="category"/>
            <h3>{name}</h3>
        </Link>
    </IonSlide>
);
