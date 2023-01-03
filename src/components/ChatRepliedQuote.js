const Quote = ({ message, contact, repliedMessage }) => (

    <div className="in-chat-reply-to-container">
        <h1>{ contact.name }</h1>
        <p>{ repliedMessage.preview }</p>
    </div>
)

export const ChatRepliedQuote = ({ message, contact, repliedMessage }) => {

    if (message.reply && repliedMessage) {

        return <Quote message={ message } contact={ contact } repliedMessage={ repliedMessage } />;
    } else {

        return "";
    }
}