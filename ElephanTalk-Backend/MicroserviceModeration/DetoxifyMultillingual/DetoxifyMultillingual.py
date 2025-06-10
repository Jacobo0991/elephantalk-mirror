import torch
import transformers

MODEL_URL = "https://github.com/unitaryai/detoxify/releases/download/v0.4-alpha/multilingual_debiased-0b549669.ckpt"

PRETRAINED_MODEL = None

def get_model_and_tokenizer(
    model_type, model_name, tokenizer_name, num_classes, state_dict, huggingface_config_path=None
):
    model_class = getattr(transformers, model_name)
    config = model_class.config_class.from_pretrained(model_type, num_labels=num_classes)
    model = model_class.from_pretrained(
        pretrained_model_name_or_path=None,
        config=huggingface_config_path or config,
        state_dict=state_dict,
        local_files_only=huggingface_config_path is not None,
    )
    tokenizer = getattr(transformers, tokenizer_name).from_pretrained(
        huggingface_config_path or model_type,
        local_files_only=huggingface_config_path is not None,
    )

    return model, tokenizer

def load_checkpoint(device="cpu", huggingface_config_path=None):
    checkpoint_path = MODEL_URL
    loaded = torch.hub.load_state_dict_from_url(checkpoint_path, map_location=device)
    class_names = loaded["config"]["dataset"]["args"]["classes"]
    change_names = {
        "toxic": "toxicity",
        "identity_hate": "identity_attack",
        "severe_toxic": "severe_toxicity",
    }
    class_names = [change_names.get(cl, cl) for cl in class_names]
    model, tokenizer = get_model_and_tokenizer(
        **loaded["config"]["arch"]["args"],
        state_dict=loaded["state_dict"],
        huggingface_config_path=huggingface_config_path,
    )

    return model, tokenizer, class_names

class Detoxify:
    """Detoxify
    Predict if a comment or list of comments is toxic using the multilingual model.
    Args:
        device(str or torch.device): accepts any torch.device input or
                                     torch.device object, defaults to cpu
        huggingface_config_path: path to HF config and tokenizer files needed for offline model loading
    Returns:
        results(dict): dictionary of output scores for each class
    """

    def __init__(self, device="cpu", huggingface_config_path=None):
        super().__init__()
        self.model, self.tokenizer, self.class_names = load_checkpoint(
            device=device,
            huggingface_config_path=huggingface_config_path,
        )
        self.device = device
        self.model.to(self.device)

    @torch.no_grad()
    def predict(self, text):
        self.model.eval()
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True).to(self.model.device)
        out = self.model(**inputs)[0]
        scores = torch.sigmoid(out).cpu().detach().numpy()
        results = {}
        for i, cla in enumerate(self.class_names):
            results[cla] = (
                scores[0][i] if isinstance(text, str) else [scores[ex_i][i].tolist() for ex_i in range(len(scores))]
            )
        return results

def multilingual_toxic_xlm_r():
    return Detoxify()
