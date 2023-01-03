import { Store } from 'pullstate';

const ContactStore = new Store({

	contacts: [
		{
            id: 1,
			name: "Amy Sister",
			avatar: "/assets/amy.jpeg"
		},
		{
            id: 2,
			name: "Max Lynch",
			avatar: "/assets/max.jpeg"
		},
        {
            id: 3,
			name: "Mike Hartington",
			avatar: "/assets/mike.jpeg"
		},
        {
            id: 4,
			name: "Henk Jurriens",
			avatar: "/assets/henk.jpeg"
		},
        {
            id: 5,
			name: "Simon Grimm",
			avatar: "/assets/simon.jpeg"
		},
        {
            id: 6,
			name: "Josh Morony",
			avatar: "/assets/josh.jpeg"
		},
        {
            id: 7,
			name: "Elon Musk",
			avatar: "/assets/elon.jpeg"
		},
        {
            id: 8,
			name: "Bill Gates",
			avatar: "/assets/bill.jpeg"
		},
        {
            id: 9,
			name: "Mark Zuckerberg",
			avatar: "/assets/mark.jpeg"
		},
		{
            id: 10,
			name: "Ionic Framework (not)",
			avatar: "/assets/ionic.png"
		},
	]
});

export default ContactStore;