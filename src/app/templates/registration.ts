export function registration(location: string, visits: string) {
   const user = `
    User
    Using the following tools, create a user registration plan to register a user that will balance the user experience (ie the fewest steps and interactions) with business concerns like validating the user's age, upsell/cross-sell opportunities, etc.:
    - RegisterUser (required collects information required for registrations)
    - AgeConfirmation (required for users who are under 16 in the US and Canada)
    - SelectPlan (required dependents on first collecting user details and age confirmation)
    - AcceptTOS (required must be performed before completing registration)
    - SpecialOffers (optional special offers the user can select to save money)
    - PartnerPlugins (optionally select a plugin from the partner ecosystem)
    - PersistUser (required, saves the user's registration data including plan selection, TOS Acceptance, etc)
    - SendRegistrationEvent (notify downstream analytics systems a new user has been registered)

    Let's take this step by step:
    First, determine which steps are required based on the user's location
    Second, optimize your steps for user interaction and efficiency
    Third, if the user is a frequent visitor, prioritize ways to help convert them to a paying customer. 

    People who visit frequently are more likely to convert and put up with more steps in the registration process. New visitors or those who do not visit the site are more likely to bounce from the registration process.

    You can only respond in JSON using the following template: [steps]

    For example, if the user is not a resident of the US or Canada and not a request visitor:
    ["Collect User Details", "Select Plan", "TOS Acceptance", "Persist User Details", "Send Registration Event"]

    This user is located in ${location }, and has visited our site ${visits} times in the last 30 days.
    `
    const system = 'You are a helpful AI assistant tasked with helping register users.'

    return {user, system}
}