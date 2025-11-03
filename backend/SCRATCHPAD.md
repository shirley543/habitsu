Working through DB structure:

- A user can have many goals. Goals are not shared between users
- A goal consists of:
  - Title: string
  - Description: string
  - Colour: hex code, hence string?
  - Emoji: hex code, hence string?
  - Private/ Public: whether private (only visible to them), or public (visible to everyone)
  - Type: discrete (count) or continuous (measured value) [number] or checkbox (yes/ no) [boolean] (used by frontend for determining colour intensity)
    - Numeric goal:
      - Unit: string
      - target: number
    - Boolean goal:
      - Value: boolean
- A goal can have many goal entries
- A goal entry consists of:
  - Goal ID: goal it's associated with
  - Day/ Date: date it's associated with (better to store as a date, or just year + index?) (storing as date feels more extensible; what if wanting to display in other methods and not just heatmap + filtering entries by date in future?)
  - Value: number or boolean (TODOs #25 how to ensure type matches parent goal? enforceable in DB or by backend?)
    - if Numeric goal:
      - value: number
    - if Boolean goal:
      - value: boolean
  - Note: optional notes for that day

- Q: Best practise for storing emoji
- Q: How to store numerical and boolean goal; shared goal but with optional fields? i.e. unit is not necessary for boolean, but present for value.
- Q: Does this struct work for all types of goals?


- Adding/ editing/ deleting a goal
- Adding/ editing/ deleting a goal entry
- Authentication of retrieving goals for a particular user (401 unauth if attempting to retrieve goals/ goal entries that aren't public)
