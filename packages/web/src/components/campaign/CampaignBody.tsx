import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { EditSection } from './EditSection';
import type { Campaign } from '@/models/campaign.type';

interface Props {
  campaign: Campaign;
  editing: boolean;
  onEditDone: () => void;
}

export function CampaignBody({ campaign, editing, onEditDone }: Props) {
  return (
    <div>
      <h2 className="font-semibold mb-3">Email Body</h2>
      {campaign.status === 'draft' && editing ? (
        <EditSection campaign={campaign} onCancel={onEditDone} />
      ) : (
        <ReactQuill
          theme="snow"
          value={campaign.body}
          readOnly
          modules={{ toolbar: false }}
          className="quill-preview"
        />
      )}
    </div>
  );
}
