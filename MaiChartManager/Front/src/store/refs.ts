import { computed, ref } from "vue";
import { AppVersionResult, GenreXml, GetAssetsDirsResult, MusicBrief, VersionXml } from "@/client/apiGen";
import api from "@/client/api";
import { captureException } from "@sentry/vue";
import posthog from "posthog-js";

export const error = ref();
export const errorId = ref<string>();
export const errorContext = ref<string>();

export const globalCapture = async (err: any, context: string) => {
  console.log(err)
  if (err instanceof Response) {
    if (!err.bodyUsed) {
      // @ts-ignore
      err.error = await err.text();
    }
  }
  error.value = err;
  errorContext.value = context;
  errorId.value = captureException(err.error || err, {
    tags: {
      context
    }
  })
  posthog.capture('error: ' + context, {
    err,
    errorId: errorId.value,
    message: error.value?.error?.message || error.value?.error?.toString() || error.value?.message || error.value?.toString(),
  })
}

export const showNeedPurchaseDialog = ref(false);

export const selectMusicId = ref(0)
export const genreList = ref<GenreXml[]>([]);
export const addVersionList = ref<VersionXml[]>([]);
export const selectedADir = ref<string>('');
export const musicList = ref<MusicBrief[]>([]);
export const assetDirs = ref<GetAssetsDirsResult[]>([]);
export const version = ref<AppVersionResult>();

export const selectedMusicBrief = computed(() => musicList.value.find(m => m.id === selectMusicId.value));

export const updateGenreList = async () => {
  const response = await api.GetAllGenres();
  genreList.value = response.data;
}

export const updateAddVersionList = async () => {
  const response = await api.GetAllAddVersions();
  addVersionList.value = response.data;
}

export const updateSelectedAssetDir = async () => {
  selectedADir.value = (await api.GetSelectedAssetsDir()).data;
}

export const updateMusicList = async () => {
  musicList.value = (await api.GetMusicList()).data;
}

export const updateAssetDirs = async () => {
  assetDirs.value = (await api.GetAssetsDirs()).data;
}

export const updateVersion = async () => {
  version.value = (await api.GetAppVersion()).data;
}

export const updateAll = async () => Promise.all([
  updateGenreList(),
  updateAddVersionList(),
  updateSelectedAssetDir(),
  updateAssetDirs(),
  updateVersion(),
  updateMusicList(),
])
