import { CreateAnimation, IonButton, IonCol, IonIcon, IonLabel, IonRow } from "@ionic/react";
import { closeCircleOutline } from "ionicons/icons";
import { useEffect } from "react";
import { useState } from "react";

const ReplyTo = ({ contact, replyToMessage = false, replyToAnimationRef, setReplyToMessage, messageSent }) => {

    const [ cancellingReplyTo, setCancellingReplyTo ] = useState(false);

    useEffect(() => {

        messageSent && cancelReplyTo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ messageSent ]);

    const slideAnimation = {

        property: "transform",
        fromValue: "translateY(100px)",
        toValue: "translateY(0px)"
    }

    const replyToAnimation = {

        duration: 300,
        direction: !cancellingReplyTo ? "normal" : "reverse",
        iterations: "1",
        fromTo: [ slideAnimation ],
        easing: "ease-in-out"
    };

    //  Cancel the reply-to
    const cancelReplyTo = async () => {

        setCancellingReplyTo(true);
        await replyToAnimationRef.current.animation.play();
        setCancellingReplyTo(false);
        setReplyToMessage(false);
    }

    return (
        <CreateAnimation ref={ replyToAnimationRef } { ...replyToAnimation }>
            <IonRow className="ion-align-items-center chat-reply-to-row" id="replyTo">
                <IonCol size="10" className="chat-reply-to-container">
                    <IonLabel className="chat-reply-to-name">{ contact }</IonLabel>
                    <IonLabel className="chat-reply-to-message">{ replyToMessage.preview }</IonLabel>
                </IonCol>

                <IonCol size="1">

                    <IonButton fill="clear" onClick={ cancelReplyTo }>
                        <IonIcon size="large" icon={ closeCircleOutline } color="primary" />
                    </IonButton>
                </IonCol>
            </IonRow>
        </CreateAnimation>
    );
}

export default ReplyTo;