// sanity/schemas/announcement.js
// Document schema for the dynamic announcement/promo banner.
// Deploy this schema in your Sanity Studio project.

export default {

  name: 'announcement',
  title: 'Announcement Banner',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Short headline for the banner (max 120 characters).',
      validation: (Rule) =>
        Rule.required()
          .max(120)
          .error('Title is required and must be 120 characters or fewer.'),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional supporting text (max 300 characters).',
      validation: (Rule) =>
        Rule.max(300).error('Description must be 300 characters or fewer.'),
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Toggle visibility of this announcement on the website.',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
    },
    prepare({ title, isActive }) {
      return {
        title: title || 'Untitled Announcement',
        subtitle: isActive ? '🟢 Active' : '🔴 Inactive',
      };
    },
  },
};
